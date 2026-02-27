export const Heatmap = () => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="grid grid-cols-[auto_1fr] gap-2">
      <div className="flex flex-col justify-between text-xs text-gray-500">
        {days.map((d) => (
          <span key={d} className="h-6 flex items-center">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-24 gap-1">
        {days.map((d) =>
          hours.map((h) => (
            <div
              key={`${d}-${h}`}
              className="h-6 w-full rounded-sm bg-blue-100 hover:bg-blue-300 transition-colors"
              title={`${d} ${h}:00 - 0 atividades`}
              style={{ opacity: Math.random() * 0.8 + 0.2 }} // Mock intensity
            />
          )),
        )}
      </div>
    </div>
  );
};
