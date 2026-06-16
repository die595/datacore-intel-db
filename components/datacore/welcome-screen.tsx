'use client';

import { Upload, Shield, Lock, Map, BarChart3, Brain, FileText, Activity } from 'lucide-react';
import { useRef, useCallback, useState } from 'react';
import { useIntel } from '@/contexts/intel-context';
import { parseExcelFile, parseCSVFile } from '@/lib/parse-excel';
import { toast } from 'sonner';

export default function WelcomeScreen() {
  const { setRecords } = useIntel();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const buffer = await file.arrayBuffer();
      let parsed;
      if (file?.name?.endsWith('.csv')) {
        const text = new TextDecoder().decode(buffer);
        parsed = parseCSVFile(text);
      } else {
        parsed = parseExcelFile(buffer);
      }
      if ((parsed?.length ?? 0) === 0) {
        toast.error('No se encontraron registros válidos.');
      } else {
        setRecords(parsed);
        toast.success(`${parsed?.length ?? 0} registros cargados.`);
      }
    } catch (err: any) {
      toast.error('Error: ' + (err?.message ?? 'desconocido'));
    } finally {
      setImporting(false);
      if (fileInputRef?.current) fileInputRef.current.value = '';
    }
  }, [setRecords]);

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex flex-col items-center justify-center p-6">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 text-center max-w-3xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <Activity className="w-12 h-12 text-cyan-400" />
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              <span className="text-white">DATACORE</span>{' '}
              <span className="text-cyan-400">INTEL</span>
            </h1>
          </div>
        </div>

        <p className="text-gray-400 text-sm md:text-base mb-8 max-w-lg mx-auto">
          Sistema de análisis de inteligencia criminal. Importa tus datos y visualiza patrones, tendencias y zonas de riesgo en tiempo real.
        </p>

        {/* Import button */}
        <button
          onClick={() => fileInputRef?.current?.click?.()}
          disabled={importing}
          className="group relative inline-flex items-center gap-3 bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 disabled:opacity-50"
        >
          <Upload className="w-6 h-6" />
          {importing ? 'PROCESANDO DATOS...' : 'IMPORTAR INTEL'}
          <div className="absolute inset-0 rounded-xl border-2 border-cyan-400/30 group-hover:border-cyan-400/60 transition-colors" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleImport}
          className="hidden"
        />
        <p className="text-gray-600 text-xs mt-3">Soporta archivos .xlsx, .xls y .csv</p>

        {/* Features grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-12">
          {[
            { icon: Map, label: 'Mapa Interactivo', desc: 'Geolocalización' },
            { icon: BarChart3, label: 'Estadísticas', desc: 'Análisis visual' },
            { icon: Brain, label: 'Análisis IA', desc: 'Patrones y tendencias' },
            { icon: FileText, label: 'Informes PDF', desc: 'Documentación' },
          ].map((feat: any, i: number) => (
            <div key={i} className="bg-[#111827]/60 border border-cyan-900/20 rounded-lg p-4 text-center">
              <feat.icon className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <p className="text-white text-xs font-semibold">{feat?.label ?? ''}</p>
              <p className="text-gray-500 text-[10px]">{feat?.desc ?? ''}</p>
            </div>
          ))}
        </div>

        {/* Security notice */}
        <div className="mt-8 flex items-center justify-center gap-2 text-gray-500 text-xs">
          <Lock className="w-3.5 h-3.5" />
          <span>Datos procesados únicamente en el navegador. Sin almacenamiento en servidor.</span>
        </div>
      </div>
    </div>
  );
}
