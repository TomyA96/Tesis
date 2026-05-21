type GroupedItem = {
  label: string;
  primary: number;
  secondary: number;
};

type GroupedBarsMockProps = {
  data: GroupedItem[];
  max?: number;
  primaryColor?: string;
  secondaryColor?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
};

const GroupedBarsMock = ({
  data,
  max = 100,
  primaryColor = "#2563EB",
  secondaryColor = "#10B981",
  primaryLabel = "Serie A",
  secondaryLabel = "Serie B",
}: GroupedBarsMockProps) => {
  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
          {primaryLabel}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: secondaryColor }} />
          {secondaryLabel}
        </span>
      </div>

      <div className="h-60 flex items-end gap-5 border-b border-l border-slate-200 px-3 pb-3 bg-[linear-gradient(to_top,_rgba(148,163,184,0.06)_1px,_transparent_1px)] bg-[length:100%_25%]">
        {data.map((item) => {
          const primaryHeight = Math.max((item.primary / max) * 100, 3);
          const secondaryHeight = Math.max((item.secondary / max) * 100, 3);

          return (
            <div key={item.label} className="flex-1 min-w-0 flex flex-col items-center gap-2">
              <div className="h-full w-full flex items-end justify-center gap-2">
                <div
                  className="w-1/3 rounded-t-xl"
                  style={{ height: `${primaryHeight}%`, backgroundColor: primaryColor }}
                />
                <div
                  className="w-1/3 rounded-t-xl"
                  style={{ height: `${secondaryHeight}%`, backgroundColor: secondaryColor }}
                />
              </div>
              <span className="text-xs font-medium text-slate-600 text-center">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GroupedBarsMock;
