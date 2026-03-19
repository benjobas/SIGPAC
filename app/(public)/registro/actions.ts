"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { Sede } from "@/app/generated/prisma/client";
import { notificarAlumnosNuevoPaciente } from "@/lib/mail";

export type RegistroState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };

const rutRegex = /^\d{7,8}-[\dKk]$/;

const registroSchema = z.object({
  nombre: z.string().min(3, "Ingresa tu nombre completo."),
  rut: z
    .string()
    .regex(rutRegex, "Formato inválido. Usa 12345678-9 o 12345678-K."),
  telefono: z
    .string()
    .min(8, "Ingresa un teléfono válido.")
    .max(20, "Teléfono demasiado largo."),
  email: z.string().email("Email inválido.").optional().or(z.literal("")),
  edad: z
    .number({ error: "Ingresa tu edad." })
    .int()
    .min(5, "Edad mínima: 5 años.")
    .max(120, "Edad máxima: 120 años."),
  comuna: z.string().min(2, "Ingresa tu comuna."),
  motivoConsulta: z.string().min(10, "Describe brevemente tu motivo de consulta (mínimo 10 caracteres)."),
  disponibilidad: z.record(z.string(), z.array(z.enum(["am", "pm"]))),
  sedePreferencia: z.nativeEnum(Sede, { error: "Selecciona una sede." }),
});

const DIAS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"] as const;

export async function registrarPacienteAction(
  _prevState: RegistroState,
  formData: FormData,
): Promise<RegistroState> {
  // Parse disponibilidad from individual checkbox fields
  const disponibilidad: Record<string, string[]> = {};
  for (const dia of DIAS) {
    const slots: string[] = [];
    if (formData.get(`disp_${dia}_am`) === "on") slots.push("am");
    if (dia !== "sabado" && formData.get(`disp_${dia}_pm`) === "on") slots.push("pm");
    if (slots.length > 0) disponibilidad[dia] = slots;
  }

  const raw = {
    nombre: (formData.get("nombre") as string)?.trim(),
    rut: (formData.get("rut") as string)?.trim(),
    telefono: (formData.get("telefono") as string)?.trim(),
    email: (formData.get("email") as string)?.trim() || "",
    edad: Number(formData.get("edad")),
    comuna: (formData.get("comuna") as string)?.trim(),
    motivoConsulta: (formData.get("motivoConsulta") as string)?.trim(),
    disponibilidad,
    sedePreferencia: formData.get("sedePreferencia") as string,
  };

  const parsed = registroSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Por favor corrige los errores del formulario.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { nombre, rut, telefono, email, edad, comuna, motivoConsulta, sedePreferencia } =
    parsed.data;

  // Check for duplicate RUT
  const existing = await prisma.paciente.findUnique({ where: { rut } });
  if (existing) {
    return {
      status: "error",
      message: "Ya existe un registro con ese RUT.",
    };
  }

  await prisma.paciente.create({
    data: {
      nombre,
      rut,
      telefono,
      email: email || null,
      edad,
      comuna,
      motivoConsulta,
      disponibilidad: parsed.data.disponibilidad,
      sedePreferencia,
      estado: "DISPONIBLE",
    },
  });

  // Fire-and-forget: notificar alumnos cuyo array de requisitos
  // tenga al menos un match con el motivoConsulta (case-insensitive)
  notificarAlumnosMatcheantes(motivoConsulta, sedePreferencia, parsed.data.disponibilidad).catch(
    () => {/* silencioso — el registro ya fue exitoso */},
  );

  return { status: "success" };
}

async function notificarAlumnosMatcheantes(
  motivoConsulta: string,
  sede: Sede,
  disponibilidad: Record<string, string[]>,
): Promise<void> {
  const alumnos = await prisma.alumno.findMany({ select: { email: true, requisitos: true } });

  const motivoLower = motivoConsulta.toLowerCase();
  const emails = alumnos
    .filter((alumno) => {
      const requisitos = alumno.requisitos as string[];
      return requisitos.some((req) => motivoLower.includes(req.toLowerCase()));
    })
    .map((alumno) => alumno.email);

  await notificarAlumnosNuevoPaciente({ motivoConsulta, sede, disponibilidad, emails });
}
