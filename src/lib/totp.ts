import { authenticator } from "otplib";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";

// Tolerate ±1 step (30s) of clock drift between server and authenticator.
authenticator.options = { window: 1, step: 30, digits: 6 };

const ISSUER = "INVITATION.LK";

export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

export function buildOtpauthUrl(email: string, secret: string): string {
  return authenticator.keyuri(email, ISSUER, secret);
}

export async function buildQrCodeDataUrl(otpauthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpauthUrl, { margin: 1, width: 220 });
}

export function verifyTotp(secret: string, code: string): boolean {
  if (!/^\d{6}$/.test(code.trim())) return false;
  try {
    return authenticator.check(code.trim(), secret);
  } catch {
    return false;
  }
}

// Backup codes are 10 random alphanumeric characters, uppercase, no ambiguous
// glyphs (no 0/O, 1/I/L). Presented to the user once on enable.
const BACKUP_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  while (codes.length < count) {
    const bytes = randomBytes(16);
    let s = "";
    for (let i = 0; i < 10; i++) {
      s += BACKUP_ALPHABET[bytes[i] % BACKUP_ALPHABET.length];
    }
    codes.push(`${s.slice(0, 5)}-${s.slice(5)}`);
  }
  return codes;
}

export function normalizeBackupCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s|-/g, "");
}

export async function hashBackupCode(code: string): Promise<string> {
  return bcrypt.hash(normalizeBackupCode(code), 10);
}

export async function verifyBackupCode(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(normalizeBackupCode(plain), hash);
}
