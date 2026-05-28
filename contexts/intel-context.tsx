'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export interface IntelRecord {
  id: number;
  departamento: string;
  municipio: string;
  vereda: string;
  latGrados: number;
  latMinutos: number;
  latSegundos: number;
  lonGrados: number;
  lonMinutos: number;
  lonSegundos: number;
  latitud: number;
  longitud: number;
  fecha: string;
  tipologia: string;
  informacionHecho: string;
  fenomenoCriminalidad: string;
  medios: string;
  genero: string;
  estructura: string;
  respuestaAccion: string;
  accionEnemiga: string;
  resTipo: string;
}

export interface Filters {
  fechaInicio: string;
  fechaFin: string;
  departamento: string;
  municipio: string;
  tipologia: string;
  fenomeno: string;
  estructura: string;
}

interface IntelContextType {
  records: IntelRecord[];
  setRecords: (records: IntelRecord[]) => void;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  filteredRecords: IntelRecord[];
  destroyData: () => void;
  isDataLoaded: boolean;
  uniqueValues: {
    departamentos: string[];
    municipios: string[];
    tipologias: string[];
    fenomenos: string[];
    estructuras: string[];
  };
}

const defaultFilters: Filters = {
  fechaInicio: '',
  fechaFin: '',
  departamento: '',
  municipio: '',
  tipologia: '',
  fenomeno: '',
  estructura: '',
};

const IntelContext = createContext<IntelContextType | null>(null);

export function IntelProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<IntelRecord[]>([]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const isDataLoaded = records?.length > 0;

  const uniqueValues = useMemo(() => {
    const safeRecords = records ?? [];
    return {
      departamentos: [...new Set(safeRecords?.map((r: IntelRecord) => r?.departamento)?.filter(Boolean) ?? [])].sort(),
      municipios: [...new Set(safeRecords?.map((r: IntelRecord) => r?.municipio)?.filter(Boolean) ?? [])].sort(),
      tipologias: [...new Set(safeRecords?.map((r: IntelRecord) => r?.tipologia?.trim())?.filter(Boolean) ?? [])].sort(),
      fenomenos: [...new Set(safeRecords?.map((r: IntelRecord) => r?.fenomenoCriminalidad)?.filter(Boolean) ?? [])].sort(),
      estructuras: [...new Set(safeRecords?.map((r: IntelRecord) => r?.estructura)?.filter(Boolean) ?? [])].sort(),
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    const safeRecords = records ?? [];
    return safeRecords?.filter((r: IntelRecord) => {
      if (filters?.fechaInicio && r?.fecha < filters.fechaInicio) return false;
      if (filters?.fechaFin && r?.fecha > filters.fechaFin) return false;
      if (filters?.departamento && r?.departamento !== filters.departamento) return false;
      if (filters?.municipio && r?.municipio !== filters.municipio) return false;
      if (filters?.tipologia && r?.tipologia?.trim() !== filters.tipologia) return false;
      if (filters?.fenomeno && r?.fenomenoCriminalidad !== filters.fenomeno) return false;
      if (filters?.estructura && r?.estructura !== filters.estructura) return false;
      return true;
    }) ?? [];
  }, [records, filters]);

  const destroyData = useCallback(() => {
    setRecords([]);
    setFilters(defaultFilters);
  }, []);

  return (
    <IntelContext.Provider
      value={{
        records,
        setRecords,
        filters,
        setFilters,
        filteredRecords,
        destroyData,
        isDataLoaded,
        uniqueValues,
      }}
    >
      {children}
    </IntelContext.Provider>
  );
}

export function useIntel() {
  const context = useContext(IntelContext);
  if (!context) {
    throw new Error('useIntel must be used within IntelProvider');
  }
  return context;
}
