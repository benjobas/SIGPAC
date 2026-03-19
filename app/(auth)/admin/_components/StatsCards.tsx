type Props = {
  total: number;
  disponibles: number;
  asignados: number;
  atendidosMes: number;
};

export default function StatsCards({ total, disponibles, asignados, atendidosMes }: Props) {
  const cards = [
    { label: "Total pacientes", value: total, className: "text-gray-900" },
    { label: "Disponibles", value: disponibles, className: "text-green-600" },
    { label: "Asignados", value: asignados, className: "text-blue-600" },
    { label: "Atendidos este mes", value: atendidosMes, className: "text-purple-600" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className={`mt-1 text-3xl font-bold tabular-nums ${card.className}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
