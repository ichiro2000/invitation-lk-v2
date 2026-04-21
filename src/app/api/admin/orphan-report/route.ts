import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { toCsv, csvResponseHeaders } from "@/lib/csv";

// Read-only report of rows whose owning User no longer exists or has a
// NULL userId. Identified via LEFT JOIN so the result is authoritative
// even when Prisma's relation filters disagree with DB reality.

type Category =
  | "guests"
  | "invitations"
  | "orders"
  | "sessions"
  | "accounts"
  | "supportTickets";

const SAMPLE_SIZE = 20;

type Sample = Record<string, unknown>;

type CountsAndSamples = {
  category: Category;
  label: string;
  count: number;
  samples: Sample[];
};

async function fetchOrphans(): Promise<CountsAndSamples[]> {
  const queries: Array<{
    category: Category;
    label: string;
    count: Promise<unknown>;
    samples: Promise<unknown>;
  }> = [
    {
      category: "guests",
      label: "Guest",
      count: prisma.$queryRaw`
        SELECT COUNT(*)::int AS count
        FROM "Guest" g
        LEFT JOIN "User" u ON u.id = g."userId"
        WHERE u.id IS NULL
      `,
      samples: prisma.$queryRaw`
        SELECT g.id, g.name, g.email, g.whatsapp, g."userId",
               g."createdAt"
        FROM "Guest" g
        LEFT JOIN "User" u ON u.id = g."userId"
        WHERE u.id IS NULL
        ORDER BY g."createdAt" DESC
        LIMIT ${SAMPLE_SIZE}
      `,
    },
    {
      category: "invitations",
      label: "Invitation",
      count: prisma.$queryRaw`
        SELECT COUNT(*)::int AS count
        FROM "Invitation" i
        LEFT JOIN "User" u ON u.id = i."userId"
        WHERE u.id IS NULL
      `,
      samples: prisma.$queryRaw`
        SELECT i.id, i.slug, i."groomName", i."brideName",
               i."userId", i."createdAt"
        FROM "Invitation" i
        LEFT JOIN "User" u ON u.id = i."userId"
        WHERE u.id IS NULL
        ORDER BY i."createdAt" DESC
        LIMIT ${SAMPLE_SIZE}
      `,
    },
    {
      category: "orders",
      label: "Order",
      count: prisma.$queryRaw`
        SELECT COUNT(*)::int AS count
        FROM "Order" o
        LEFT JOIN "User" u ON u.id = o."userId"
        WHERE u.id IS NULL
      `,
      samples: prisma.$queryRaw`
        SELECT o.id, o.plan::text AS plan, o.amount::text AS amount,
               o."paymentStatus"::text AS "paymentStatus",
               o."userId", o."createdAt"
        FROM "Order" o
        LEFT JOIN "User" u ON u.id = o."userId"
        WHERE u.id IS NULL
        ORDER BY o."createdAt" DESC
        LIMIT ${SAMPLE_SIZE}
      `,
    },
    {
      category: "sessions",
      label: "NextAuth Session",
      count: prisma.$queryRaw`
        SELECT COUNT(*)::int AS count
        FROM "Session" s
        LEFT JOIN "User" u ON u.id = s."userId"
        WHERE u.id IS NULL
      `,
      samples: prisma.$queryRaw`
        SELECT s.id, s."userId", s.expires
        FROM "Session" s
        LEFT JOIN "User" u ON u.id = s."userId"
        WHERE u.id IS NULL
        ORDER BY s.expires DESC
        LIMIT ${SAMPLE_SIZE}
      `,
    },
    {
      category: "accounts",
      label: "NextAuth Account",
      count: prisma.$queryRaw`
        SELECT COUNT(*)::int AS count
        FROM "Account" a
        LEFT JOIN "User" u ON u.id = a."userId"
        WHERE u.id IS NULL
      `,
      samples: prisma.$queryRaw`
        SELECT a.id, a."userId", a.provider, a.type
        FROM "Account" a
        LEFT JOIN "User" u ON u.id = a."userId"
        WHERE u.id IS NULL
        LIMIT ${SAMPLE_SIZE}
      `,
    },
    {
      category: "supportTickets",
      label: "Support Ticket",
      count: prisma.$queryRaw`
        SELECT COUNT(*)::int AS count
        FROM "SupportTicket" t
        LEFT JOIN "User" u ON u.id = t."userId"
        WHERE u.id IS NULL
      `,
      samples: prisma.$queryRaw`
        SELECT t.id, t.subject, t.status::text AS status,
               t."userId", t."createdAt"
        FROM "SupportTicket" t
        LEFT JOIN "User" u ON u.id = t."userId"
        WHERE u.id IS NULL
        ORDER BY t."createdAt" DESC
        LIMIT ${SAMPLE_SIZE}
      `,
    },
  ];

  const results = await Promise.all(
    queries.map(async ({ category, label, count, samples }) => {
      try {
        const [countRow, sampleRows] = await Promise.all([count, samples]);
        const countValue = Array.isArray(countRow) && countRow[0]
          ? Number((countRow[0] as { count?: number | string }).count ?? 0)
          : 0;
        return {
          category,
          label,
          count: countValue,
          samples: Array.isArray(sampleRows) ? (sampleRows as Sample[]) : [],
        } as CountsAndSamples;
      } catch (error) {
        console.error(`Orphan report ${category} failed:`, error);
        return {
          category,
          label,
          count: -1,
          samples: [],
        } as CountsAndSamples;
      }
    })
  );

  return results;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (me?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") ?? "json";
    const category = searchParams.get("category") as Category | null;

    if (format === "csv") {
      if (!category) {
        return NextResponse.json(
          { error: "category parameter required for CSV export" },
          { status: 400 }
        );
      }
      const all = await fetchOrphans();
      const found = all.find((r) => r.category === category);
      if (!found) {
        return NextResponse.json(
          { error: `Unknown category: ${category}` },
          { status: 400 }
        );
      }
      if (found.samples.length === 0) {
        return new NextResponse("", {
          status: 200,
          headers: csvResponseHeaders(`orphan-${category}`),
        });
      }
      const keys = Object.keys(found.samples[0]);
      const rows = found.samples.map((row) =>
        keys.map((k) => {
          const v = row[k];
          if (v instanceof Date) return v.toISOString();
          return v ?? "";
        })
      );
      return new NextResponse(toCsv(keys, rows), {
        status: 200,
        headers: csvResponseHeaders(`orphan-${category}`),
      });
    }

    const report = await fetchOrphans();
    return NextResponse.json({ report });
  } catch (error) {
    console.error("Orphan report error:", error);
    return NextResponse.json(
      { error: "Failed to generate orphan report" },
      { status: 500 }
    );
  }
}
