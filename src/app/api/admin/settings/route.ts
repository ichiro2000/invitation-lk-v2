import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { logAdminAction } from "@/lib/audit-log";
import {
  SETTING_DEFS,
  SETTING_KEY_SET,
  SETTING_BY_KEY,
  defaultFor,
  validateValue,
  type SettingKey,
} from "@/lib/settings";
import { resetSettingsCache } from "@/lib/settings-read";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Unauthorized" as const, status: 401 as const };
  }
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (me?.role !== "ADMIN") {
    return { error: "Forbidden" as const, status: 403 as const };
  }
  return { session };
}

export async function GET() {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const rows = await prisma.systemSetting.findMany({
      select: { key: true, value: true, updatedAt: true, updatedBy: true },
    });
    const stored = new Map(rows.map((r) => [r.key, r]));

    const values: Record<string, {
      value: string;
      isDefault: boolean;
      updatedAt: string | null;
      updatedBy: string | null;
    }> = {};

    for (const def of SETTING_DEFS) {
      const row = stored.get(def.key);
      values[def.key] = {
        value: row?.value ?? def.default,
        isDefault: !row,
        updatedAt: row?.updatedAt ? row.updatedAt.toISOString() : null,
        updatedBy: row?.updatedBy ?? null,
      };
    }

    return NextResponse.json({ defs: SETTING_DEFS, values });
  } catch (error) {
    console.error("Admin settings GET error:", error);
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json().catch(() => null);
    if (
      !body ||
      typeof body !== "object" ||
      !body.updates ||
      typeof body.updates !== "object"
    ) {
      return NextResponse.json({ error: "Missing updates object" }, { status: 400 });
    }

    const updates = body.updates as Record<string, unknown>;
    const errors: Record<string, string> = {};
    const normalized: { key: SettingKey; value: string }[] = [];

    for (const [key, raw] of Object.entries(updates)) {
      if (!SETTING_KEY_SET.has(key)) {
        errors[key] = "Unknown setting";
        continue;
      }
      if (typeof raw !== "string") {
        errors[key] = "Value must be a string";
        continue;
      }
      const def = SETTING_BY_KEY.get(key as SettingKey)!;
      const value = def.type === "bool" ? raw : raw.trim();
      const ok = validateValue(def, value);
      if (ok !== true) {
        errors[key] = ok;
        continue;
      }
      normalized.push({ key: key as SettingKey, value });
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: "Validation failed", errors },
        { status: 400 }
      );
    }

    if (normalized.length === 0) {
      return NextResponse.json({ updated: [], changed: [] });
    }

    const existing = await prisma.systemSetting.findMany({
      where: { key: { in: normalized.map((n) => n.key) } },
      select: { key: true, value: true },
    });
    const existingMap = new Map(existing.map((e) => [e.key, e.value]));

    const changed: { key: string; from: string; to: string }[] = [];
    for (const { key, value } of normalized) {
      const prev = existingMap.get(key) ?? defaultFor(key);
      if (prev === value) continue;
      await prisma.systemSetting.upsert({
        where: { key },
        create: { key, value, updatedBy: auth.session.user.id },
        update: { value, updatedBy: auth.session.user.id },
      });
      changed.push({ key, from: prev, to: value });
    }

    if (changed.length > 0) {
      resetSettingsCache();
      await logAdminAction({
        actorUserId: auth.session.user.id,
        action: "settings.update",
        targetType: "Settings",
        metadata: { changes: changed },
        request,
      });
    }

    return NextResponse.json({
      updated: changed.map((c) => c.key),
      changed,
    });
  } catch (error) {
    console.error("Admin settings PUT error:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
