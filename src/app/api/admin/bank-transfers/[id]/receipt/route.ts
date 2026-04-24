import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// Admin-only: fetch a single bank-transfer receipt image on demand. The list
// endpoint at /api/admin/orders used to include the full base64-encoded
// receiptImage on every row, which meant a 50-order page could pull tens of
// MB before the admin clicked a single "View" button. This endpoint lets
// the list stay slim and pulls the receipt only when needed.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (adminUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const transfer = await prisma.bankTransfer.findUnique({
      where: { id },
      select: { receiptImage: true },
    });
    if (!transfer) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Tell browsers + the DO edge not to cache. Receipts are PII and we
    // don't want one admin's request to land in another's cache.
    return NextResponse.json(
      { receiptImage: transfer.receiptImage },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("Admin receipt fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load receipt" },
      { status: 500 }
    );
  }
}
