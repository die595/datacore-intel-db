'use client';

import { useIntel } from '@/contexts/intel-context';
import { Upload, Trash2, Calendar, Filter, X, FileText, Activity } from 'lucide-react';
import { useRef, useState, useCallback } from 'react';
import { parseExcelFile, parseCSVFile } from '@/lib/parse-excel';
import { toast } from 'sonner';

export default function Header() {
  const { setRecords, isDataLoaded, destroyData, filters, setFilters, uniqueValues, filteredRecords, records } = useIntel();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [showDestroyConfirm, setShowDestroyConfirm] = useState(false);

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
        toast.error('No se encontraron registros válidos en el archivo.');
      } else {
        setRecords(parsed);
        toast.success(`${parsed?.length ?? 0} registros cargados exitosamente.`);
      }
    } catch (err: any) {
      toast.error('Error al procesar el archivo: ' + (err?.message ?? 'desconocido'));
    } finally {
      setImporting(false);
      if (fileInputRef?.current) fileInputRef.current.value = '';
    }
  }, [setRecords]);

  const handleDestroy = useCallback(() => {
    destroyData();
    setShowDestroyConfirm(false);
    toast.success('Datos destruidos exitosamente. Memoria limpia.');
  }, [destroyData]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0A0F1C]/95 backdrop-blur-md border-b border-cyan-900/30 flex items-center px-4 gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-4 flex-shrink-0">
          <Activity className="w-6 h-6 text-cyan-400" />
          <span className="font-display text-lg font-bold tracking-tight text-white hidden sm:inline">DATACORE</span>
          <span className="font-display text-lg font-bold tracking-tight text-cyan-400 hidden sm:inline">INTEL</span>
        </div>

        {/* Filters row */}
        {isDataLoaded && (
          <div className="flex items-center gap-2 flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <input
                type="date"
                value={filters?.fechaInicio ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...(filters ?? {}), fechaInicio: e?.target?.value ?? '' } as any)}
                className="bg-[#111827] border border-cyan-900/40 rounded px-2 py-1 text-xs text-cyan-100 font-mono w-[120px]"
              />
              <span className="text-cyan-600 text-xs">-</span>
              <input
                type="date"
                value={filters?.fechaFin ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...(filters ?? {}), fechaFin: e?.target?.value ?? '' } as any)}
                className="bg-[#111827] border border-cyan-900/40 rounded px-2 py-1 text-xs text-cyan-100 font-mono w-[120px]"
              />
            </div>

            <select
              value={filters?.departamento ?? ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({ ...(filters ?? {}), departamento: e?.target?.value ?? '', municipio: '' } as any)}
              className="bg-[#111827] border border-cyan-900/40 rounded px-2 py-1 text-xs text-cyan-100 min-w-[100px]"
            >
              <option value="">Todos Dptos</option>
              {(uniqueValues?.departamentos ?? []).map((d: string) => <option key={d} value={d}>{d}</option>)}
            </select>

            <select
              value={filters?.municipio ?? ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({ ...(filters ?? {}), municipio: e?.target?.value ?? '' } as any)}
              className="bg-[#111827] border border-cyan-900/40 rounded px-2 py-1 text-xs text-cyan-100 min-w-[100px]"
            >
              <option value="">Todos Mpios</option>
              {(uniqueValues?.municipios ?? [])
                .filter((m: string) => !filters?.departamento || (records ?? []).some((r: any) => r?.municipio === m && r?.departamento === filters.departamento))
                .map((m: string) => <option key={m} value={m}>{m}</option>)}
            </select>

            <select
              value={filters?.tipologia ?? ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({ ...(filters ?? {}), tipologia: e?.target?.value ?? '' } as any)}
              className="bg-[#111827] border border-cyan-900/40 rounded px-2 py-1 text-xs text-cyan-100 min-w-[100px] hidden md:block"
            >
              <option value="">Todas Tipologías</option>
              {(uniqueValues?.tipologias ?? []).map((t: string) => <option key={t} value={t}>{t}</option>)}
            </select>

            <button
              onClick={() => setFilters({ fechaInicio: '', fechaFin: '', departamento: '', municipio: '', tipologia: '', fenomeno: '', estructura: '' })}
              className="flex items-center gap-1 bg-cyan-900/30 hover:bg-cyan-800/40 text-cyan-300 px-2 py-1 rounded text-xs transition-colors flex-shrink-0"
            >
              <X className="w-3 h-3" /> Limpiar
            </button>

            <div className="text-xs text-cyan-500 font-mono flex-shrink-0">
              {filteredRecords?.length ?? 0}/{records?.length ?? 0}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          {isDataLoaded && (
            <button
              onClick={() => setShowDestroyConfirm(true)}
              className="flex items-center gap-1.5 bg-red-900/40 hover:bg-red-800/60 text-red-400 hover:text-red-300 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border border-red-800/40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">DESTRUIR DATOS</span>
            </button>
          )}
          <button
            onClick={() => fileInputRef?.current?.click?.()}
            disabled={importing}
            className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            {importing ? 'PROCESANDO...' : 'IMPORTAR INTEL'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </header>

      {/* Destroy Confirmation Modal */}
      {showDestroyConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-red-800/50 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-display font-bold">DESTRUIR DATOS</h3>
                <p className="text-red-400 text-xs">Esta acción es irreversible</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-6">Todos los datos cargados en memoria serán eliminados permanentemente. No se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDestroyConfirm(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDestroy}
                className="flex-1 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
              >
                CONFIRMAR DESTRUCCIÓN
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
