"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

export default function RefreshSessionOnSuccess() {
  const { update } = useSession();
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    update().catch(() => {});
  }, [update]);
  return null;
}
