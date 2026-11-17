import { Link } from "react-router-dom";
import { cn } from "../../../../lib/cn";

type Tab = {
  id: string;
  label: string;
  // Si la pestaña es otra pantalla, se pasa su ruta y se dibuja como link
  to?: string;
};

type TabsInformeProps = {
  tabs: Tab[];
  activeTab: string;
};

const TabsInforme = ({ tabs, activeTab }: TabsInformeProps) => {
  return (
    <div className="inline-flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
      {tabs.map((tab) => {
        const clase = cn(
          "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150",
          activeTab === tab.id
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-500 hover:bg-slate-50"
        );

        return tab.to ? (
          <Link key={tab.id} to={tab.to} className={clase}>
            {tab.label}
          </Link>
        ) : (
          <button key={tab.id} type="button" className={clase}>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default TabsInforme;
