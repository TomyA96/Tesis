type Segment = {
  label: string;
  value: number;
  color: string;
  helper?: string;
};

type StackedProgressMockProps = {
  titulo?: string;
  totalLabel?: string;
  segments: Segment[];
};

const StackedProgressMock = ({
  titulo,
  totalLabel,
  segments,
}: StackedProgressMockProps) => {
  const total = segments.reduce((acc, segment) => acc + segment.value, 0);

  return (
    <div className="flex flex-col gap-4">
      {(titulo || totalLabel) && (
        <div className="flex items-center justify-between gap-3">
          {titulo && <h4 className="text-sm font-semibold text-slate-800">{titulo}</h4>}
          {totalLabel && <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{totalLabel}</span>}
        </div>
      )}

      <div className="flex h-4 overflow-hidden rounded-full bg-slate-100">
        {segments.map((segment) => (
          <div
            key={segment.label}
            style={{ width: `${(segment.value / total) * 100}%`, backgroundColor: segment.color }}
          />
        ))}
      </div>

      <div className="grid gap-3">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <span
                className="mt-1 h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: segment.color }}
              />
              <div>
                <p className="text-sm font-medium text-slate-700">{segment.label}</p>
                {segment.helper && <p className="text-xs text-slate-400">{segment.helper}</p>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">{segment.value}</p>
              <p className="text-xs text-slate-400">{Math.round((segment.value / total) * 100)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StackedProgressMock;
