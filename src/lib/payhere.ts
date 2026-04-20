import crypto from "crypto";

export type PayHereMode = "sandbox" | "live";

export const PAYHERE_CHECKOUT_URLS: Record<PayHereMode, string> = {
  sandbox: "https://sandbox.payhere.lk/pay/checkout",
  live: "https://www.payhere.lk/pay/checkout",
};

export const PAYHERE_STATUS = {
  SUCCESS: "2",
  PENDING: "0",
  CANCELED: "-1",
  FAILED: "-2",
  CHARGEDBACK: "-3",
} as const;

function getMode(): PayHereMode {
  return process.env.PAYHERE_MODE === "live" ? "live" : "sandbox";
}

export function getPayHereConfig() {
  const merchantId = process.env.PAYHERE_MERCHANT_ID;
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
  if (!merchantId || !merchantSecret) {
    throw new Error(
      "PAYHERE_MERCHANT_ID and PAYHERE_MERCHANT_SECRET must be set"
    );
  }
  const mode = getMode();
  return {
    merchantId,
    merchantSecret,
    mode,
    checkoutUrl: PAYHERE_CHECKOUT_URLS[mode],
  };
}

function md5Upper(input: string): string {
  return crypto.createHash("md5").update(input).digest("hex").toUpperCase();
}

export function buildCheckoutHash(params: {
  merchantId: string;
  merchantSecret: string;
  orderId: string;
  amount: number;
  currency: string;
}): string {
  const amountFormatted = params.amount.toFixed(2);
  const secretHash = md5Upper(params.merchantSecret);
  return md5Upper(
    params.merchantId +
      params.orderId +
      amountFormatted +
      params.currency +
      secretHash
  );
}

export function verifyNotifyMd5Sig(params: {
  merchantId: string;
  merchantSecret: string;
  orderId: string;
  payhereAmount: string;
  payhereCurrency: string;
  statusCode: string;
  receivedMd5Sig: string;
}): boolean {
  const secretHash = md5Upper(params.merchantSecret);
  const expected = md5Upper(
    params.merchantId +
      params.orderId +
      params.payhereAmount +
      params.payhereCurrency +
      params.statusCode +
      secretHash
  );
  const received = params.receivedMd5Sig.toUpperCase();
  if (expected.length !== received.length) return false;
  // Constant-time compare to avoid leaking the MD5 byte-by-byte via timing.
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}
