import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/pacientes" className="text-sm font-bold text-gray-900">
            SIGPAC USS
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/pacientes"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Pacientes
            </Link>
            <Link
              href="/mi-paciente"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Mi paciente
            </Link>
            {session.user.rol === "DOCENTE" && (
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Admin
              </Link>
            )}
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">{session.user.name ?? session.user.email}</span>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
