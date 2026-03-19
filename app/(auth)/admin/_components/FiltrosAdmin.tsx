"use client";

import { useRouter, useSearchParams } from "next/navigation";

const ESTADOS = [
  { value: "", label: "Todos los estados" },
  { value: "DISPONIBLE", label: "Disponible" },
  { value: "ASIGNADO", label: "Asignado" },
  { value: "EN_CONTACTO", label: "En contacto" },
  { value: "CITA_AGENDADA", label: "Cita agendada" },
  { value: "NO_RESPONDE", label: "No responde" },
  { value: "ATENDIDO", label: "Atendido" },
];

const SEDES = [
  { value: "", label: "Todas las sedes" },
  { value: "SANTIAGO", label: "Santiago" },
  { value: "CONCEPCION", label: "Concepción" },
  { value: "VALDIVIA", label: "Valdivia" },
  { value: "PATAGONIA", label: "Patagonia" },
];

export default function FiltrosAdmin() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("vista");
    router.push(`/admin?${params.toString()}`);
  }

  const estado = searchParams.get("estado") ?? "";
  const sede = searchParams.get("sede") ?? "";
  const desde = searchParams.get("desde") ?? "";
  const hasFilters = estado || sede || desde;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={estado}
        onChange={(e) => update("estado", e.target.value)}
        className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900"
      >
        {ESTADOS.map((e) => (
          <option key={e.value} value={e.value}>
            {e.label}
          </option>
        ))}
      </select>

      <select
        value={sede}
        onChange={(e) => update("sede", e.target.value)}
        className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900"
      >
        {SEDES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-500">Registro desde:</label>
        <input
          type="date"
          value={desde}
          onChange={(e) => update("desde", e.target.value)}
          className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      {hasFilters && (
        <button
          onClick={() => router.push("/admin")}
          className="text-sm text-gray-400 underline hover:text-gray-600"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
