'use client';

import { useIntel } from '@/contexts/intel-context';
import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line,
} from 'recharts';

const COLORS = ['#FF4444', '#00D9FF', '#FF9149', '#FF90BB', '#80D8C3', '#A19AD3', '#FFD700', '#FF6363', '#72BF78', '#60B5FF'];

function ChartCard({
  title,
  children,
  minHeight = 10
}: {
  title: string;
  children: React.ReactNode;
  minHeight?: number;
}) {
  return (
    <div className="bg-[#0D1321]/80 border border-cyan-900/20 rounded-lg p-2 flex flex-col">
      <h3 className="text-cyan-400 text-[9px] font-bold tracking-widest uppercase mb-1">
        {title}
      </h3>

      <div
        className="flex-1"
        style={{ minHeight }}
      >
        {children}
      </div>
    </div>
  );
}

export default function ChartsPanel() {
  const { filteredRecords, isDataLoaded } = useIntel();

  const data = useMemo(() => {
    const safeRecords = filteredRecords ?? [];
    const countMap = (key: string, limit: number = 8) => {
      const map: Record<string, number> = {};
      for (const r of safeRecords) {
        const val = String((r as any)?.[key] ?? '').trim();
        if (val) map[val] = (map[val] ?? 0) + 1;
      }
      return Object.entries(map ?? {})
        .sort((a: any, b: any) => (b?.[1] ?? 0) - (a?.[1] ?? 0))
        .slice(0, limit)
        .map(([name, count]: any) => ({ name: (name ?? '').length > 20 ? (name ?? '').substring(0, 20) + '...' : name, fullName: name, value: count }));
    };

    const timeMap: Record<string, number> = {};
    for (const r of safeRecords) {
      const fecha = r?.fecha ?? '';
      if (fecha?.length >= 7) {
        const ym = fecha.substring(0, 7);
        timeMap[ym] = (timeMap[ym] ?? 0) + 1;
      }
    }
    const timeline = Object.entries(timeMap ?? {})
      .sort((a: any, b: any) => (a?.[0] ?? '').localeCompare(b?.[0] ?? ''))
      .map(([name, count]: any) => ({ name, value: count }));

    const fenomenoShort = countMap('fenomenoCriminalidad', 6).map((item: any) => ({
      ...item,
      name: (item?.fullName ?? '').length > 15 ? (item?.fullName ?? '').substring(0, 15) + '...' : (item?.fullName ?? ''),
    }));

    return {
      tipologias: countMap('tipologia', 8),
      municipios: countMap('municipio', 10),
      fenomenos: countMap('fenomenoCriminalidad', 6),
      fenomenoRadar: fenomenoShort,
      departamentos: countMap('departamento', 5),
      timeline,
    };
  }, [filteredRecords]);

  if (!isDataLoaded) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-1 p-1">  {/* gap-2 a gap-1, p-2 a p-1 */}
      {/* Tipologias bar chart */}
      <ChartCard title="Desglose por Tipología" minHeight={250}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.tipologias} layout="vertical" margin={{ left: 10, right: 10, top: 0, bottom: 0 }}>
            <XAxis type="number" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 8, fill: '#94a3b8' }} tickLine={false} width={80} />
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(0,217,255,0.3)', borderRadius: 8, fontSize: 10 }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {(data?.tipologias ?? []).map((_: any, i: number) => (
                <Cell key={i} fill={COLORS[i % COLORS.length] ?? '#FF4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Municipios bar chart */}
      <ChartCard title="Municipio" minHeight={250}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.municipios} margin={{ left: 5, right: 5, top: 0, bottom: 20 }}>
            <XAxis dataKey="name" tick={{ fontSize: 7, fill: '#94a3b8' } as any} tickLine={false} height={40} interval={0} angle={-45} />
            <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} />
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(0,217,255,0.3)', borderRadius: 8, fontSize: 10 }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {(data?.municipios ?? []).map((_: any, i: number) => (
                <Cell key={i} fill={COLORS[i % COLORS.length] ?? '#FF4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Fenomenos pie chart */}
      <ChartCard title="Fenómeno Criminalidad" minHeight={280}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.fenomenos}
              cx="50%"
              cy="50%"
              outerRadius={65}
              innerRadius={30}
              dataKey="value"
              label={({ name, percent }: any) => `${(name ?? '').substring(0, 10)} ${((percent ?? 0) * 100)?.toFixed?.(0) ?? '0'}%`}
              labelLine={false}
              style={{ fontSize: 9 }}
            >
              {(data?.fenomenos ?? []).map((_: any, i: number) => (
                <Cell key={i} fill={COLORS[i % COLORS.length] ?? '#FF4444'} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(0,217,255,0.3)', borderRadius: 8, fontSize: 10 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Radar chart */}
      <ChartCard title="Análisis Radar Fenómenos" minHeight={280}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data.fenomenoRadar} cx="50%" cy="50%" outerRadius={65}>
            <PolarGrid stroke="#ffd700" />
            <PolarAngleAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} />
            <PolarRadiusAxis tick={{ fontSize: 7, fill: '#64748b' }} />
            <Radar name="Casos" dataKey="value" stroke="#00D9FF" fill="#00D9FF" fillOpacity={0.3} />
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(0,217,255,0.3)', borderRadius: 8, fontSize: 10 }} />
          </RadarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Timeline */}
      <div className="md:col-span-2 xl:col-span-4">
        <ChartCard title="Línea Temporal de Incidentes">
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={data.timeline} margin={{ left: 5, right: 5, top: 0, bottom: 15 }}>
              <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#94a3b8' } as any} tickLine={false} height={35} interval="preserveStartEnd" angle={-45} />
              <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(0,217,255,0.3)', borderRadius: 8, fontSize: 10 }} />
              <Line type="monotone" dataKey="value" stroke="#00D9FF" strokeWidth={2} dot={{ fill: '#00D9FF', r: 2 }} activeDot={{ r: 4, fill: '#FF4444' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}