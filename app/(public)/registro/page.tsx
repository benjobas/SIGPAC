import { RegistroForm } from "./_components/RegistroForm";

export const metadata = {
  title: "Registro de pacientes — USS Odontología",
  description:
    "Regístrate para recibir atención dental gratuita a cargo de estudiantes de odontología de la Universidad San Sebastián.",
};

export default function RegistroPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Encabezado */}
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Universidad San Sebastián · Facultad de Odontología
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Registro de pacientes
          </h1>
          <p className="mt-3 text-sm text-gray-600 max-w-md mx-auto">
            Completa el formulario para solicitar atención dental gratuita a cargo
            de nuestros estudiantes supervisados por docentes.
          </p>
        </div>

        {/* Formulario */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <RegistroForm />
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Tus datos son confidenciales y serán usados únicamente con fines clínicos.
        </p>
      </div>
    </main>
  );
}
