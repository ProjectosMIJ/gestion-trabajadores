"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export function SignOut() {
  return (
    <Button
      variant={"destructive"}
      onClick={() => signOut({ redirectTo: "/login" })}
      className="mt-5"
    >
      Cerrar Sesión
    </Button>
  );
}
