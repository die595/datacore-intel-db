'use client';

import { useIntel } from '@/contexts/intel-context';
import { useMemo } from 'react';
import { Shield, MapPin, Crosshair, Users, AlertTriangle, BarChart3, Zap } from 'lucide-react';

function StatBar({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  const pct = max > 0 ? ((count ?? 0) / max) * 100 : 0;
  return (
    <div className="mb-1.5">
      <div className="flex justify-between text-[10px] mb-0.5">
        <span className="text-gray-300 truncate mr-2 max-w-[180px]">{label ?? 'N/A'}</span>
        <span className={`font-mono font-bold flex-shrink-0 ${color}`}>{count ?? 0}</span>
      </div>
      <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color === 'text-red-400' ? 'bg-red-500' : color === 'text-cyan-400' ? 'bg-cyan-500' : color === 'text-orange-400' ? 'bg-orange-500' : color === 'text-green-400' ? 'bg-green-500' : 'bg-purple-500'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StatSection({ title, icon, items, color }: { title: string; icon: React.ReactNode; items: { name: string; count: number }[]; color: string }) {
  const max = items?.[0]?.count ?? 1;
  return (
    <div className="bg-[#0D1321]/80 border border-cyan-900/20 rounded-lg p-3 mb-2">
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className={`text-[10px] font-bold tracking-wider uppercase ${color}`}>{title}</span>
      </div>
      {(items ?? []).slice(0, 8).map((item: any, i: number) => (
        <StatBar key={i} label={item?.name ?? 'N/A'} count={item?.count ?? 0} max={max} color={color} />
      ))}
      {(items?.length ?? 0) === 0 && <p className="text-gray-600 text-[10px]">Sin datos</p>}
    </div>
  );
}

export default function StatsSidebar() {
  const { filteredRecords, isDataLoaded } = useIntel();

  const stats = useMemo(() => {
    const safeRecords = filteredRecords ?? [];
    const countMap = (key: string) => {
      const map: Record<string, number> = {};
      for (const r of safeRecords) {
        const val = String((r as any)?.[key] ?? '').trim();
        if (val) map[val] = (map[val] ?? 0) + 1;
      }
      return Object.entries(map ?? {})
        .sort((a: any, b: any) => (b?.[1] ?? 0) - (a?.[1] ?? 0))
        .map(([name, count]: any) => ({ name, count }));
    };

    return {
      tipologias: countMap('tipologia'),
      fenomenos: countMap('fenomenoCriminalidad'),
      estructuras: countMap('estructura'),
      respuestas: countMap('respuestaAccion'),
      acciones: countMap('accionEnemiga'),
      municipios: countMap('municipio'),
      departamentos: countMap('departamento'),
    };
  }, [filteredRecords]);

  if (!isDataLoaded) return null;

  return (
    <div className="w-full h-full overflow-y-auto scrollbar-hide p-2 space-y-1">
      {/* Total cases */}
      <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 border border-cyan-500/30 rounded-lg p-4 text-center mb-2">
        <p className="text-cyan-400 text-[10px] font-bold tracking-widest uppercase">CASOS IDENTIFICADOS</p>
        <p className="text-white text-4xl font-mono font-bold mt-1">{filteredRecords?.length ?? 0}</p>
      </div>

      <StatSection title="DESGLOSE POR TIPOLOGÍA" icon={<Crosshair className="w-3 h-3 text-red-400" />} items={stats.tipologias} color="text-red-400" />
      <StatSection title="ESTRUCTURA" icon={<Users className="w-3 h-3 text-cyan-400" />} items={stats.estructuras} color="text-cyan-400" />
      <StatSection title="RESPUESTA ACCIÓN" icon={<Shield className="w-3 h-3 text-green-400" />} items={stats.respuestas} color="text-green-400" />
      <StatSection title="FENÓMENO CRIMINALIDAD" icon={<AlertTriangle className="w-3 h-3 text-orange-400" />} items={stats.fenomenos} color="text-orange-400" />
      <StatSection title="ACCIÓN ENEMIGA" icon={<Zap className="w-3 h-3 text-purple-400" />} items={stats.acciones} color="text-purple-400" />
      <StatSection title="MUNICIPIO" icon={<MapPin className="w-3 h-3 text-red-400" />} items={stats.municipios} color="text-red-400" />
    </div>
  );
}
