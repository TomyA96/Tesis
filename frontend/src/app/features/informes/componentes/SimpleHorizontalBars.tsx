type HorizontalBarItem = {
  label: string;
  value: number;
  helper?: string;
};

type SimpleHorizontalBarsProps = {
  data: HorizontalBarItem[];
  max?: number;
  colorClass?: string;
  valueSuffix?: string;
};

const SimpleHorizontalBars = ({
  data,
  max = 100,
  colorClass = "bg-rose-500",
  valueSuffix = "",
}: SimpleHorizontalBarsProps) => {
  return (
    <div className="flex flex-col gap-4">
      {data.map((item) => {
        const width = Math.max((item.value / max) * 100, 4);
        return (
          <div key={item.label} className="grid grid-cols-[130px_1fr_60px] items-center gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-700">{item.label}</p>
              {item.helper && <p className="text-xs text-slate-400">{item.helper}</p>}
            </div>
            <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${colorClass}`}
                style={{ width: `${width}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-600 text-right">
              {item.value}
              {valueSuffix}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default SimpleHorizontalBars;
