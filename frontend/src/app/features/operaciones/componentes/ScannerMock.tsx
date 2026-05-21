import { QrCode, ScanLine } from "lucide-react";

const ScannerMock = () => {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 shadow-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.18),_transparent_58%)]" />
      <div className="relative flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
          <ScanLine className="h-4 w-4" />
          Scanner QR
        </div>

        <div className="relative flex h-72 w-full max-w-[360px] items-center justify-center rounded-[32px] border border-cyan-400/30 bg-slate-950/70 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)]">
          <div className="absolute inset-6 rounded-[24px] border-2 border-dashed border-cyan-400/30" />
          <div className="absolute left-6 right-6 top-1/2 h-0.5 -translate-y-1/2 bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.85)] animate-pulse" />
          <div className="grid grid-cols-2 gap-6 text-cyan-200/90">
            <QrCode className="h-16 w-16" />
            <QrCode className="h-16 w-16" />
            <QrCode className="h-16 w-16" />
            <QrCode className="h-16 w-16" />
          </div>
        </div>

        <p className="max-w-md text-center text-sm leading-6 text-slate-300">
          Acerque el codigo QR al area de lectura. Si no se detecta automaticamente, use el
          ingreso manual desde el campo inferior.
        </p>
      </div>
    </div>
  );
};

export default ScannerMock;
