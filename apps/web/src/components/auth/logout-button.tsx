"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <Button type="button" variant="ghost" size="icon-sm" aria-label="Sair" title="Sair" onClick={() => signOut({ callbackUrl: "/login" })}>
      <LogOut />
    </Button>
  );
}
