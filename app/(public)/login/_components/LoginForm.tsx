"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "../actions";

const initialState: LoginState = { status: "idle" };

export function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, initialState);

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-lg font-medium text-green-800">
          Revisa tu correo
        </p>
        <p className="mt-2 text-sm text-green-700">
          Te enviamos un link para ingresar. Puede tardar unos segundos.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Correo institucional
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="tu.nombre@correo.uss.cl"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {state.status === "error" && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Enviando..." : "Enviar link de acceso"}
      </button>
    </form>
  );
}
