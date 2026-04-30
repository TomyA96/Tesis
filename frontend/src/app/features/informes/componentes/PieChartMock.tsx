type Segment = {
  color: string;
  value: number;
};

type PieChartMockProps = {
  segments: Segment[];
  donut?: boolean;
  size?: "sm" | "md" | "lg";
  centerLabel?: string;
  centerValue?: string;
};

const PieChartMock = ({
  segments,
  donut = false,
  size = "md",
  centerLabel,
  centerValue,
}: PieChartMockProps) => {
  const total = segments.reduce((acc, segment) => acc + segment.value, 0);
  let acumulado = 0;

  const gradiente = segments
    .map((segment) => {
      const start = (acumulado / total) * 100;
      acumulado += segment.value;
      const end = (acumulado / total) * 100;
      return `${segment.color} ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <div className="flex items-center justify-center py-2">
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: size === "sm" ? 156 : size === "lg" ? 248 : 208,
          height: size === "sm" ? 156 : size === "lg" ? 248 : 208,
          background: `conic-gradient(${gradiente})`,
        }}
      >
        {donut && (
          <div
            className="absolute rounded-full bg-white border border-slate-100 shadow-inner flex flex-col items-center justify-center text-center"
            style={{
              width: size === "sm" ? 84 : size === "lg" ? 128 : 108,
              height: size === "sm" ? 84 : size === "lg" ? 128 : 108,
            }}
          >
            {centerLabel && (
              <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400 font-semibold">
                {centerLabel}
              </span>
            )}
            {centerValue && <span className="mt-1 text-xl font-bold text-slate-900">{centerValue}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default PieChartMock;
