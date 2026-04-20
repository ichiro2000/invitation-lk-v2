"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function RefreshSessionOnSuccess() {
  const { update } = useSession();
  useEffect(() => {
    update().catch(() => {});
  }, [update]);
  return null;
}
