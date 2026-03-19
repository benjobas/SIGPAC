"use client";

import { useActionState } from "react";
import { registrarPacienteAction, type RegistroState } from "../actions";

const initialState: RegistroState = { status: "idle" };

const SEDES = [
  { value: "SANTIAGO", label: "Santiago" },
  { value: "CONCEPCION", label: "Concepción" },
  { value: "VALDIVIA", label: "Valdivia" },
  { value: "PATAGONIA", label: "Patagonia" },
];

const DIAS = [
  { key: "lunes", label: "Lunes", tienePm: true },
  { key: "martes", label: "Martes", tienePm: true },
  { key: "miercoles", label: "Miércoles", tienePm: true },
  { key: "jueves", label: "Jueves", tienePm: true },
  { key: "viernes", label: "Viernes", tienePm: true },
  { key: "sabado", label: "Sábado", tienePm: false },
];

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-sm text-red-600">{errors[0]}</p>;
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
      {children}
    </label>
  );
}

const inputClass =
  "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

export function RegistroForm() {
  const [state, action, isPending] = useActionState(registrarPacienteAction, initialState);

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
        <p className="text-xl font-semibold text-green-800">¡Registro exitoso!</p>
        <p className="mt-3 text-sm text-green-700 max-w-sm mx-auto">
          Tu solicitud fue recibida. Un estudiante se pondrá en contacto contigo
          próximamente para coordinar una cita.
        </p>
      </div>
    );
  }

  const fieldErrors =
    state.status === "error" ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={action} className="space-y-6">
      {/* Nombre */}
      <div>
        <Label htmlFor="nombre">Nombre completo *</Label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          required
          autoComplete="name"
          placeholder="Juan Pérez González"
          className={inputClass}
        />
        <FieldError errors={fieldErrors.nombre} />
      </div>

      {/* RUT */}
      <div>
        <Label htmlFor="rut">RUT *</Label>
        <input
          id="rut"
          name="rut"
          type="text"
          required
          placeholder="12345678-9"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-gray-500">Sin puntos, con guión. Ej: 12345678-9</p>
        <FieldError errors={fieldErrors.rut} />
      </div>

      {/* Teléfono + Email */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="telefono">Teléfono *</Label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            required
            autoComplete="tel"
            placeholder="+56 9 1234 5678"
            className={inputClass}
          />
          <FieldError errors={fieldErrors.telefono} />
        </div>
        <div>
          <Label htmlFor="email">Email (opcional)</Label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="correo@ejemplo.com"
            className={inputClass}
          />
          <FieldError errors={fieldErrors.email} />
        </div>
      </div>

      {/* Edad + Comuna */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="edad">Edad *</Label>
          <input
            id="edad"
            name="edad"
            type="number"
            required
            min={5}
            max={120}
            placeholder="30"
            className={inputClass}
          />
          <FieldError errors={fieldErrors.edad} />
        </div>
        <div>
          <Label htmlFor="comuna">Comuna *</Label>
          <input
            id="comuna"
            name="comuna"
            type="text"
            required
            placeholder="Providencia"
            className={inputClass}
          />
          <FieldError errors={fieldErrors.comuna} />
        </div>
      </div>

      {/* Motivo de consulta */}
      <div>
        <Label htmlFor="motivoConsulta">Motivo de consulta *</Label>
        <textarea
          id="motivoConsulta"
          name="motivoConsulta"
          required
          rows={4}
          placeholder="Describe brevemente por qué buscas atención dental..."
          className={inputClass}
        />
        <FieldError errors={fieldErrors.motivoConsulta} />
      </div>

      {/* Disponibilidad */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">
          Disponibilidad horaria *
        </p>
        <p className="text-xs text-gray-500 mb-3">
          Marca los horarios en que puedes asistir (AM = mañana, PM = tarde).
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-3 py-2 font-medium text-gray-600 border border-gray-200">
                  Día
                </th>
                <th className="px-3 py-2 font-medium text-gray-600 border border-gray-200">AM</th>
                <th className="px-3 py-2 font-medium text-gray-600 border border-gray-200">PM</th>
              </tr>
            </thead>
            <tbody>
              {DIAS.map(({ key, label, tienePm }) => (
                <tr key={key} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border border-gray-200 text-gray-700">{label}</td>
                  <td className="px-3 py-2 border border-gray-200 text-center">
                    <input
                      type="checkbox"
                      name={`disp_${key}_am`}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-3 py-2 border border-gray-200 text-center">
                    {tienePm ? (
                      <input
                        type="checkbox"
                        name={`disp_${key}_pm`}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sede de preferencia */}
      <div>
        <Label htmlFor="sedePreferencia">Sede de preferencia *</Label>
        <select
          id="sedePreferencia"
          name="sedePreferencia"
          required
          defaultValue=""
          className={inputClass}
        >
          <option value="" disabled>
            Selecciona una sede...
          </option>
          {SEDES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <FieldError errors={fieldErrors.sedePreferencia} />
      </div>

      {/* Error general */}
      {state.status === "error" && !state.fieldErrors && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">
          {state.message}
        </p>
      )}
      {state.status === "error" && state.fieldErrors && (
        <p className="rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-700 border border-yellow-200">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Enviando..." : "Registrarme como paciente"}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Los campos marcados con * son obligatorios.
      </p>
    </form>
  );
}
