"use client";

import { useState, useMemo } from "react";
import { PacienteCard } from "./PacienteCard";

const SEDES = [
  { value: "", label: "Todas las sedes" },
  { value: "SANTIAGO", label: "Santiago" },
  { value: "CONCEPCION", label: "Concepción" },
  { value: "VALDIVIA", label: "Valdivia" },
  { value: "PATAGONIA", label: "Patagonia" },
];

const DIAS = [
  { value: "", label: "Cualquier día" },
  { value: "lunes", label: "Lunes" },
  { value: "martes", label: "Martes" },
  { value: "miercoles", label: "Miércoles" },
  { value: "jueves", label: "Jueves" },
  { value: "viernes", label: "Viernes" },
  { value: "sabado", label: "Sábado" },
];

const TURNOS = [
  { value: "", label: "AM o PM" },
  { value: "am", label: "AM (mañana)" },
  { value: "pm", label: "PM (tarde)" },
];

type Paciente = {
  id: string;
  nombre: string;
  edad: number;
  comuna: string;
  motivoConsulta: string;
  disponibilidad: Record<string, string[]>;
  sedePreferencia: string;
};

type Props = {
  pacientes: Paciente[];
};

export function PacientesClient({ pacientes }: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [sede, setSede] = useState("");
  const [dia, setDia] = useState("");
  const [turno, setTurno] = useState("");

  const resultados = useMemo(() => {
    return pacientes.filter((p) => {
      if (
        busqueda.trim() &&
        !p.motivoConsulta.toLowerCase().includes(busqueda.trim().toLowerCase())
      ) {
        return false;
      }
      if (sede && p.sedePreferencia !== sede) return false;
      if (dia) {
        const slots: string[] = p.disponibilidad[dia] ?? [];
        if (slots.length === 0) return false;
        if (turno && !slots.includes(turno)) return false;
      }
      return true;
    });
  }, [pacientes, busqueda, sede, dia, turno]);

  return (
    <div>
      {/* Filtros */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="search"
            placeholder="Buscar por motivo de consulta..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="col-span-1 sm:col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <select
            value={sede}
            onChange={(e) => setSede(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {SEDES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <select
              value={dia}
              onChange={(e) => {
                setDia(e.target.value);
                if (!e.target.value) setTurno("");
              }}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {DIAS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
            <select
              value={turno}
              onChange={(e) => setTurno(e.target.value)}
              disabled={!dia}
              className="w-28 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            >
              {TURNOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Conteo */}
      <p className="mb-4 text-sm text-gray-500">
        {resultados.length === pacientes.length
          ? `${pacientes.length} pacientes disponibles`
          : `${resultados.length} de ${pacientes.length} pacientes`}
      </p>

      {/* Lista */}
      {resultados.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center">
          <p className="text-sm font-medium text-gray-500">
            No hay pacientes que coincidan con los filtros.
          </p>
          <button
            onClick={() => {
              setBusqueda("");
              setSede("");
              setDia("");
              setTurno("");
            }}
            className="mt-3 text-sm text-blue-600 hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resultados.map((p) => (
            <PacienteCard key={p.id} paciente={p} />
          ))}
        </div>
      )}
    </div>
  );
}
