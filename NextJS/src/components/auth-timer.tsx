"use client";
import { useEffect, useCallback, useState, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function AuthController() {
  const { data: session } = useSession();
  const [showAlert, setShowAlert] = useState(false);

  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

  const TOTAL_TIME = 30 * 1000; // 30s
  const WARNING_TIME = 10 * 1000; // 10s antes

  const handleLogout = useCallback(() => {
    console.log("🔴 Ejecutando Logout...");
    signOut({ callbackUrl: "/login" });
  }, []);

  useEffect(() => {
    if (!session) return;

    const resetTimer = () => {
      // 1. Limpiar timers anteriores
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

      // 2. Solo actualizar el estado si la alerta estaba visible
      // Esto evita re-renders innecesarios cada milímetro que mueves el mouse
      setShowAlert((prev) => {
        if (prev)
          console.log(
            "🟢 Actividad detectada: Ocultando alerta y reiniciando contadores",
          );
        return false;
      });

      // 3. Timer para la alerta
      warningTimerRef.current = setTimeout(() => {
        console.log("🟡 Alerta: Quedan 10 segundos");
        setShowAlert(true);
      }, TOTAL_TIME - WARNING_TIME);

      // 4. Timer para el logout
      logoutTimerRef.current = setTimeout(() => {
        handleLogout();
      }, TOTAL_TIME);
    };

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    events.forEach((event) => document.addEventListener(event, resetTimer));

    // CORRECCIÓN VITAL: Iniciar el timer apenas carga el componente
    console.log("🚀 AuthController activo: Iniciando contadores de 30s");
    resetTimer();

    return () => {
      events.forEach((event) =>
        document.removeEventListener(event, resetTimer),
      );
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, [session, handleLogout, TOTAL_TIME, WARNING_TIME]);

  if (!session) return null;

  return (
    <Dialog open={showAlert} onOpenChange={setShowAlert}>
      <DialogContent
        // Evita que el usuario cierre el modal con ESC o clic fuera si quieres ser estricto
        onPointerDownOutside={(e) => e.preventDefault()}
        className="sm:max-w-[425px] border-none bg-transparent shadow-none p-0"
      >
        <Card className="px-6 py-10 rounded-2xl z-[99999] font-bold text-center flex flex-col gap-4 border-2 border-red-500 shadow-2xl bg-white">
          <span className="text-4xl text-red-500">⚠️</span>
          <p className="text-xl">Tu sesión expirará pronto por inactividad.</p>
          <span className="text-sm font-normal text-muted-foreground">
            Mueve el mouse o presiona una tecla para continuar
          </span>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
