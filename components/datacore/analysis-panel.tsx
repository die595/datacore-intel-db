'use client';

import { useIntel } from '@/contexts/intel-context';
import { useMemo } from 'react';
import { analyzeData } from '@/lib/analysis';
import { Brain, AlertTriangle, TrendingUp, MapPin, Link2, Shield } from 'lucide-react';

export default function AnalysisPanel() {
  const { filteredRecords, isDataLoaded } = useIntel();

  const analysis = useMemo(() => {
    return analyzeData(filteredRecords ?? []);
  }, [filteredRecords]);

  if (!isDataLoaded) return null;

  return (
    <div className="p-2">
      <div className="bg-[#0D1321]/80 border border-cyan-900/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-cyan-400" />
          <h2 className="text-cyan-400 text-sm font-bold tracking-widest uppercase">ANÁLISIS INTELIGENTE</h2>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] text-gray-400">NIVEL DE RIESGO</span>
            <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${(analysis?.riskScore ?? 0) > 70 ? 'bg-red-500' : (analysis?.riskScore ?? 0) > 40 ? 'bg-orange-500' : 'bg-green-500'}`}
                style={{ width: `${analysis?.riskScore ?? 0}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-white">{analysis?.riskScore ?? 0}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Top municipios */}
          <div className="bg-[#111827]/60 rounded-lg p-3 border border-red-900/20">
            <div className="flex items-center gap-1.5 mb-2">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span className="text-red-400 text-[10px] font-bold tracking-wider">ZONAS DE MAYOR RIESGO</span>
            </div>
            {(analysis?.topMunicipios ?? []).map((m: any, i: number) => (
              <div key={i} className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">{i + 1}. {m?.name ?? 'N/A'}</span>
                <span className="text-red-400 font-mono font-bold">{m?.count ?? 0}</span>
              </div>
            ))}
          </div>

          {/* Top tipologias */}
          <div className="bg-[#111827]/60 rounded-lg p-3 border border-cyan-900/20">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-cyan-400 text-[10px] font-bold tracking-wider">TIPOLOGÍAS FRECUENTES</span>
            </div>
            {(analysis?.topTipologias ?? []).map((t: any, i: number) => (
              <div key={i} className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">{i + 1}. {t?.name ?? 'N/A'}</span>
                <span className="text-cyan-400 font-mono font-bold">{t?.count ?? 0}</span>
              </div>
            ))}
          </div>

          {/* Correlaciones */}
          <div className="bg-[#111827]/60 rounded-lg p-3 border border-purple-900/20">
            <div className="flex items-center gap-1.5 mb-2">
              <Link2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-purple-400 text-[10px] font-bold tracking-wider">CORRELACIONES</span>
            </div>
            {(analysis?.correlaciones ?? []).slice(0, 5).map((c: any, i: number) => (
              <div key={i} className="text-[10px] text-gray-400 mb-1">
                <span className="text-gray-300">{(c?.fenomeno ?? '').substring(0, 30)}</span>
                <span className="text-purple-400 mx-1">→</span>
                <span className="text-gray-300">{(c?.estructura ?? '').substring(0, 20)}</span>
                <span className="text-purple-400 font-mono ml-1">({c?.count ?? 0})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-3 bg-[#111827]/60 rounded-lg p-3 border border-green-900/20">
          <div className="flex items-center gap-1.5 mb-2">
            <Shield className="w-3.5 h-3.5 text-green-400" />
            <span className="text-green-400 text-[10px] font-bold tracking-wider">RECOMENDACIONES DE SEGURIDAD</span>
          </div>
          <div className="space-y-1.5">
            {(analysis?.recomendaciones ?? []).map((rec: string, i: number) => (
              <p key={i} className="text-xs text-gray-300 leading-relaxed">{rec ?? ''}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
