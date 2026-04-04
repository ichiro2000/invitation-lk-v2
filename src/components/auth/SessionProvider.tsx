"use client";
import { SessionProvider as P } from "next-auth/react";
import { ReactNode } from "react";
export default function SessionProvider({ children }: { children: ReactNode }) {
  return <P>{children}</P>;
}
