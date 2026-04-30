type InsightItem = {
  label: string;
  value: string;
  helper?: string;
};

type InsightListProps = {
  items: InsightItem[];
};

const InsightList = ({ items }: InsightListProps) => {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-600">{item.label}</p>
              {item.helper && <p className="mt-1 text-xs text-slate-400">{item.helper}</p>}
            </div>
            <span className="text-lg font-bold text-slate-900">{item.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InsightList;
