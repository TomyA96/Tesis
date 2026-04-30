type Pair = {
  label: string;
  value: string;
};

type InfoPairsProps = {
  items: Pair[];
  columns?: 1 | 2;
};

const InfoPairs = ({ items, columns = 2 }: InfoPairsProps) => {
  return (
    <div className={`grid gap-4 ${columns === 2 ? "md:grid-cols-2" : "grid-cols-1"}`}>
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            {item.label}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-800">{item.value}</p>
        </div>
      ))}
    </div>
  );
};

export default InfoPairs;
