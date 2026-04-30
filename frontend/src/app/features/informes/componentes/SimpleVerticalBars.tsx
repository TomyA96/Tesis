type BarItem = {
  label: string;
  value: number;
  helper?: string;
};

type SimpleVerticalBarsProps = {
  data: BarItem[];
  max?: number;
  colorClass?: string;
  showValues?: boolean;
};

const SimpleVerticalBars = ({
  data,
  max = 100,
  colorClass = "bg-blue-500",
  showValues = false,
}: SimpleVerticalBarsProps) => {
  return (
    <div className="w-full">
      <div className="h-56 flex items-end gap-4 border-b border-l border-slate-200 px-3 pb-3 bg-[linear-gradient(to_top,_rgba(148,163,184,0.06)_1px,_transparent_1px)] bg-[length:100%_25%]">
        {data.map((item) => {
          const height = Math.max((item.value / max) * 100, 3);
          return (
            <div key={item.label} className="flex-1 min-w-0 flex flex-col items-center gap-2">
              {showValues && (
                <span className="text-xs font-semibold text-slate-500">{item.value}</span>
              )}
              <div
                style={{ height: `${height}%` }}
                className={`w-full rounded-t-xl ${colorClass} shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]`}
              />
              <div className="text-center">
                <span className="text-xs font-medium text-slate-600">{item.label}</span>
                {item.helper && <p className="text-[11px] text-slate-400">{item.helper}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimpleVerticalBars;
