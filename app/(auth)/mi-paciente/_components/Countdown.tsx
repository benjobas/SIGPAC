"use client";

import { useState, useEffect } from "react";

type Props = {
  expiraEn: string; // ISO string
};

function calcularRestante(expiraEn: string) {
  return Math.max(0, new Date(expiraEn).getTime() - Date.now());
}

function formatearTiempo(ms: number) {
  const totalSegundos = Math.floor(ms / 1000);
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;
  return {
    texto: `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`,
    horas,
  };
}

export function Countdown({ expiraEn }: Props) {
  const [restante, setRestante] = useState(() => calcularRestante(expiraEn));

  useEffect(() => {
    if (restante <= 0) return;

    const id = setInterval(() => {
      const nuevo = calcularRestante(expiraEn);
      setRestante(nuevo);
      if (nuevo <= 0) clearInterval(id);
    }, 1000);

    return () => clearInterval(id);
  }, [expiraEn, restante]);

  if (restante <= 0) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center">
        <p className="text-sm font-semibold text-red-700">Asignación expirada</p>
        <p className="mt-0.5 text-xs text-red-500">
          Esta asignación venció. El paciente podría haber sido liberado.
        </p>
      </div>
    );
  }

  const { texto, horas } = formatearTiempo(restante);

  const estilos =
    horas < 1
      ? { outer: "border-red-200 bg-red-50", label: "text-red-500", time: "text-red-700" }
      : horas < 4
        ? { outer: "border-yellow-200 bg-yellow-50", label: "text-yellow-600", time: "text-yellow-800" }
        : { outer: "border-green-200 bg-green-50", label: "text-green-600", time: "text-green-800" };

  return (
    <div className={`rounded-lg border px-4 py-3 text-center ${estilos.outer}`}>
      <p className={`text-xs font-medium uppercase tracking-wide ${estilos.label}`}>
        Tiempo para contactar
      </p>
      <p className={`mt-1 text-2xl font-mono font-bold tabular-nums ${estilos.time}`}>
        {texto}
      </p>
      {horas < 1 && (
        <p className="mt-0.5 text-xs text-red-500">¡Menos de 1 hora! Contacta al paciente.</p>
      )}
    </div>
  );
}
