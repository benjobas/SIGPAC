import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "./_components/LoginForm";

export const metadata = {
  title: "Ingresar — SIGPAC USS",
};

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/pacientes");
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">SIGPAC USS</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gestión de pacientes clínicos
          </p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-200">
          <h2 className="mb-6 text-base font-semibold text-gray-800">
            Ingresa con tu email institucional
          </h2>
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Solo emails <span className="font-medium">@correo.uss.cl</span>
        </p>
      </div>
    </main>
  );
}
