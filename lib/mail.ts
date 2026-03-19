import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "SIGPAC USS <no-reply@sigpac.uss.cl>";

type Disponibilidad = Record<string, string[]>;

function formatDisponibilidad(disp: Disponibilidad): string {
  const DIAS: Record<string, string> = {
    lunes: "Lunes",
    martes: "Martes",
    miercoles: "Miércoles",
    jueves: "Jueves",
    viernes: "Viernes",
    sabado: "Sábado",
  };
  return Object.entries(disp)
    .map(([dia, slots]) => `${DIAS[dia] ?? dia}: ${slots.join(", ")}`)
    .join(" | ");
}

export async function notificarAlumnosNuevoPaciente({
  motivoConsulta,
  sede,
  disponibilidad,
  emails,
}: {
  motivoConsulta: string;
  sede: string;
  disponibilidad: Disponibilidad;
  emails: string[];
}): Promise<void> {
  if (emails.length === 0) return;

  const appUrl = process.env.NEXTAUTH_URL ?? "https://sigpac.uss.cl";
  const dispTexto = formatDisponibilidad(disponibilidad);

  await resend.batch.send(
    emails.map((email) => ({
      from: FROM,
      to: email,
      subject: `Nuevo paciente disponible — ${motivoConsulta}`,
      text: [
        `Hay un nuevo paciente disponible que puede calzar con tus requisitos clínicos.`,
        ``,
        `Motivo de consulta: ${motivoConsulta}`,
        `Sede: ${sede}`,
        `Disponibilidad: ${dispTexto}`,
        ``,
        `Revisa el listado completo en: ${appUrl}/pacientes`,
      ].join("\n"),
    })),
  );
}
