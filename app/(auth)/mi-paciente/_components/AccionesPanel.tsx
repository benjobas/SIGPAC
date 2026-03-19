"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import {
  contactadoAction,
  citaAgendadaAction,
  noRespondeAction,
  type AccionState,
} from "../actions";

type Props = {
  asignacionId: string;
  estadoActual: string;
};

const BOTONES = [
  {
    key: "contactado",
    label: "Contactado",
    labelPending: "Registrando...",
    action: contactadoAction,
    style: "bg-blue-600 hover:bg-blue-700 text-white",
    // Disable when these states are already set or more advanced
    disableOn: ["CITA_AGENDADA", "NO_RESPONDE"],
  },
  {
    key: "cita",
    label: "Cita agendada",
    labelPending: "Registrando...",
    action: citaAgendadaAction,
    style: "bg-green-600 hover:bg-green-700 text-white",
    disableOn: ["NO_RESPONDE"],
  },
  {
    key: "no_responde",
    label: "No responde",
    labelPending: "Registrando...",
    action: noRespondeAction,
    style: "bg-orange-500 hover:bg-orange-600 text-white",
    disableOn: ["CITA_AGENDADA"],
  },
] as const;

export function AccionesPanel({ asignacionId, estadoActual }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [estadoLocal, setEstadoLocal] = useState(estadoActual);

  function handleAccion(
    key: string,
    action: (id: string) => Promise<AccionState>,
  ) {
    setError(null);
    setActiveKey(key);
    startTransition(async () => {
      const result = await action(asignacionId);
      if (result.status === "success") {
        // Map action key to the resulting estado for immediate UI feedback
        const nuevoEstado = key === "contactado"
          ? "CONTACTADO"
          : key === "cita"
            ? "CITA_AGENDADA"
            : "NO_RESPONDE";
        setEstadoLocal(nuevoEstado);
        router.refresh();
      } else {
        setError(result.message);
      }
      setActiveKey(null);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        {BOTONES.map(({ key, label, labelPending, action, style, disableOn }) => {
          const isDisabled =
            isPending || disableOn.includes(estadoLocal as never);
          const isActive = activeKey === key && isPending;

          return (
            <button
              key={key}
              onClick={() => handleAccion(key, action)}
              disabled={isDisabled}
              className={`flex-1 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${style}`}
            >
              {isActive ? labelPending : label}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
