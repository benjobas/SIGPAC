"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { asignarPacienteAction } from "../actions";

const DIAS_LABEL: Record<string, string> = {
  lunes: "Lun",
  martes: "Mar",
  miercoles: "Mié",
  jueves: "Jue",
  viernes: "Vie",
  sabado: "Sáb",
};

const SEDE_LABEL: Record<string, string> = {
  SANTIAGO: "Santiago",
  CONCEPCION: "Concepción",
  VALDIVIA: "Valdivia",
  PATAGONIA: "Patagonia",
};

type Props = {
  paciente: {
    id: string;
    nombre: string;
    edad: number;
    comuna: string;
    motivoConsulta: string;
    disponibilidad: Record<string, string[]>;
    sedePreferencia: string;
  };
};

export function PacienteCard({ paciente }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [asignado, setAsignado] = useState(false);

  function handleAsignar() {
    setError(null);
    startTransition(async () => {
      const result = await asignarPacienteAction(paciente.id);
      if (result.status === "success") {
        setAsignado(true);
        router.push("/mi-paciente");
      } else {
        setError(result.message);
      }
    });
  }

  const diasEntries = Object.entries(paciente.disponibilidad).filter(
    ([, slots]) => slots.length > 0,
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-900">{paciente.nombre}</p>
          <p className="text-sm text-gray-500">
            {paciente.edad} años · {paciente.comuna}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-100">
          {SEDE_LABEL[paciente.sedePreferencia] ?? paciente.sedePreferencia}
        </span>
      </div>

      {/* Motivo */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">
          Motivo de consulta
        </p>
        <p className="text-sm text-gray-700 line-clamp-3">{paciente.motivoConsulta}</p>
      </div>

      {/* Disponibilidad */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">
          Disponibilidad
        </p>
        <div className="flex flex-wrap gap-1.5">
          {diasEntries.length === 0 ? (
            <span className="text-xs text-gray-400">Sin horario registrado</span>
          ) : (
            diasEntries.map(([dia, slots]) =>
              slots.map((slot) => (
                <span
                  key={`${dia}-${slot}`}
                  className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                >
                  {DIAS_LABEL[dia] ?? dia} {slot.toUpperCase()}
                </span>
              )),
            )
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Button */}
      <button
        onClick={handleAsignar}
        disabled={isPending || asignado}
        className="mt-auto w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Asignando..." : asignado ? "Asignado" : "Asignarme este paciente"}
      </button>
    </div>
  );
}
