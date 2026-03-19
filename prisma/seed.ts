import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Rol, Sede } from "../app/generated/prisma/client";

// Pasa PoolConfig directamente (sin instanciar Pool) para evitar conflictos de tipos
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Sembrando alumnos de prueba...");

  await prisma.alumno.deleteMany();

  await prisma.alumno.createMany({
    data: [
      {
        email: "ana.martinez@correo.uss.cl",
        nombre: "Ana Martínez Rojas",
        sede: Sede.SANTIAGO,
        año: 3,
        rol: Rol.ESTUDIANTE,
        requisitos: [
          "protesis_removible",
          "endodoncia",
          "periodoncia_basica",
        ],
      },
      {
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
      {
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
      {
        email: "jorge.vidal@correo.uss.cl",
        nombre: "Dr. Jorge Vidal Contreras",
        sede: Sede.SANTIAGO,
        año: 0,
        rol: Rol.DOCENTE,
        requisitos: [],
      },
      {
        email: "patricia.soto@correo.uss.cl",
        nombre: "Dra. Patricia Soto Alvarado",
        sede: Sede.SANTIAGO,
        año: 0,
        rol: Rol.DOCENTE,
        requisitos: [],
      },
    ],
  });

  const count = await prisma.alumno.count();
  console.log(`✓ ${count} alumnos creados correctamente.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
