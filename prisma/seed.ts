import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  Rol,
  Sede,
  EstadoPaciente,
  EstadoAsignacion,
} from "../app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Limpiando datos anteriores...");
  await prisma.asignacion.deleteMany();
  await prisma.paciente.deleteMany();
  await prisma.alumno.deleteMany();

  // ─── Alumnos ──────────────────────────────────────────────────────────────
  console.log("Sembrando alumnos...");

  const [ana, carlos, sofia, jorge, patricia] = await Promise.all([
    prisma.alumno.create({
      data: {
        email: "ana.martinez@correo.uss.cl",
        nombre: "Ana Martínez Rojas",
        sede: Sede.SANTIAGO,
        año: 3,
        rol: Rol.ESTUDIANTE,
        requisitos: ["protesis_removible", "endodoncia", "periodoncia_basica"],
      },
    }),
    prisma.alumno.create({
      data: {
        email: "carlos.fuentes@correo.uss.cl",
        nombre: "Carlos Fuentes Díaz",
        sede: Sede.SANTIAGO,
        año: 4,
        rol: Rol.ESTUDIANTE,
        requisitos: [
          "operatoria_dental",
          "cirugia_oral_basica",
          "endodoncia",
          "radiologia",
        ],
      },
    }),
    prisma.alumno.create({
      data: {
        email: "sofia.herrera@correo.uss.cl",
        nombre: "Sofía Herrera Muñoz",
        sede: Sede.SANTIAGO,
        año: 5,
        rol: Rol.ESTUDIANTE,
        requisitos: [
          "protesis_fija",
          "implantologia_basica",
          "ortodoncia_basica",
          "periodoncia_quirurgica",
        ],
      },
    }),
    prisma.alumno.create({
      data: {
        email: "jorge.vidal@correo.uss.cl",
        nombre: "Dr. Jorge Vidal Contreras",
        sede: Sede.SANTIAGO,
        año: 0,
        rol: Rol.DOCENTE,
        requisitos: [],
      },
    }),
    prisma.alumno.create({
      data: {
        email: "patricia.soto@correo.uss.cl",
        nombre: "Dra. Patricia Soto Alvarado",
        sede: Sede.SANTIAGO,
        año: 0,
        rol: Rol.DOCENTE,
        requisitos: [],
      },
    }),
  ]);

  console.log(`✓ ${5} alumnos creados.`);

  // ─── Pacientes ────────────────────────────────────────────────────────────
  console.log("Sembrando pacientes...");

  const pacientes = await Promise.all([
    // DISPONIBLES — para elegir
    prisma.paciente.create({
      data: {
        nombre: "Roberto Saavedra Pinto",
        rut: "12.345.678-9",
        telefono: "+56912345678",
        email: "roberto.saavedra@gmail.com",
        edad: 45,
        comuna: "Providencia",
        motivoConsulta: "Dolor molar inferior derecho y sensibilidad al frío",
        disponibilidad: { lunes: ["am", "pm"], miercoles: ["am"], viernes: ["pm"] },
        sedePreferencia: Sede.SANTIAGO,
        estado: EstadoPaciente.DISPONIBLE,
      },
    }),
    prisma.paciente.create({
      data: {
        nombre: "Carmen Gloria Valdés",
        rut: "9.876.543-2",
        telefono: "+56987654321",
        email: "cgvaldes@hotmail.com",
        edad: 62,
        comuna: "Las Condes",
        motivoConsulta: "Necesita prótesis removible superior, falta de dientes por caries antiguas",
        disponibilidad: { martes: ["am"], jueves: ["am", "pm"] },
        sedePreferencia: Sede.SANTIAGO,
        estado: EstadoPaciente.DISPONIBLE,
      },
    }),
    prisma.paciente.create({
      data: {
        nombre: "Felipe Araya Morales",
        rut: "15.432.109-8",
        telefono: "+56915432109",
        edad: 28,
        comuna: "Ñuñoa",
        motivoConsulta: "Revisión general, limpieza y tratamiento de caries múltiples",
        disponibilidad: { lunes: ["pm"], miercoles: ["pm"], viernes: ["am", "pm"] },
        sedePreferencia: Sede.SANTIAGO,
        estado: EstadoPaciente.DISPONIBLE,
      },
    }),
    prisma.paciente.create({
      data: {
        nombre: "Marcela Jiménez Torres",
        rut: "11.223.344-5",
        telefono: "+56911223344",
        email: "mjimenez@gmail.com",
        edad: 38,
        comuna: "Maipú",
        motivoConsulta: "Encías sangrantes y movilidad dental, posible periodoncia",
        disponibilidad: { lunes: ["am"], martes: ["am"], jueves: ["pm"] },
        sedePreferencia: Sede.SANTIAGO,
        estado: EstadoPaciente.DISPONIBLE,
      },
    }),
    prisma.paciente.create({
      data: {
        nombre: "Andrés Espinoza Lagos",
        rut: "7.654.321-0",
        telefono: "+56976543210",
        edad: 54,
        comuna: "Santiago Centro",
        motivoConsulta: "Extracción de tercer molar impactado",
        disponibilidad: { miercoles: ["am", "pm"], viernes: ["am"] },
        sedePreferencia: Sede.SANTIAGO,
        estado: EstadoPaciente.DISPONIBLE,
      },
    }),
    // ASIGNADO — ya tomado por Ana
    prisma.paciente.create({
      data: {
        nombre: "Luisa Contreras Ríos",
        rut: "13.579.246-8",
        telefono: "+56913579246",
        email: "luisa.contreras@yahoo.com",
        edad: 41,
        comuna: "Pudahuel",
        motivoConsulta: "Tratamiento de conducto en pieza 26",
        disponibilidad: { lunes: ["am", "pm"], viernes: ["pm"] },
        sedePreferencia: Sede.SANTIAGO,
        estado: EstadoPaciente.ASIGNADO,
      },
    }),
    // EN_CONTACTO — Carlos lo está contactando
    prisma.paciente.create({
      data: {
        nombre: "Tomás Guerrero Sepúlveda",
        rut: "16.802.134-7",
        telefono: "+56916802134",
        edad: 33,
        comuna: "La Florida",
        motivoConsulta: "Blanqueamiento dental y arreglo de fracturas en incisivos",
        disponibilidad: { martes: ["pm"], jueves: ["am"] },
        sedePreferencia: Sede.SANTIAGO,
        estado: EstadoPaciente.EN_CONTACTO,
      },
    }),
  ]);

  const [
    roberto,
    carmen,
    felipe,
    marcela,
    andres,
    luisa,
    tomas,
  ] = pacientes;

  console.log(`✓ ${pacientes.length} pacientes creados.`);

  // ─── Asignaciones ─────────────────────────────────────────────────────────
  console.log("Sembrando asignaciones...");

  const ahora = new Date();
  const en24h = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
  const hace6h = new Date(ahora.getTime() - 6 * 60 * 60 * 1000);
  const expira18h = new Date(hace6h.getTime() + 24 * 60 * 60 * 1000); // vence en 18h

  await Promise.all([
    // Ana tiene a Luisa asignada (PENDIENTE, expira en 24h)
    prisma.asignacion.create({
      data: {
        pacienteId: luisa.id,
        alumnoId: ana.id,
        asignadoEn: ahora,
        expiraEn: en24h,
        estado: EstadoAsignacion.PENDIENTE,
      },
    }),
    // Carlos tiene a Tomás, ya contactado (asignado hace 6h)
    prisma.asignacion.create({
      data: {
        pacienteId: tomas.id,
        alumnoId: carlos.id,
        asignadoEn: hace6h,
        expiraEn: expira18h,
        estado: EstadoAsignacion.CONTACTADO,
      },
    }),
  ]);

  console.log("✓ 2 asignaciones creadas.");
  console.log("\n✅ Seed completo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
