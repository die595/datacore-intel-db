'use client';

import { useState } from 'react';
import { useIntel } from '@/contexts/intel-context';
import Header from './header';
import StatsSidebar from './stats-sidebar';
import IntelMap from './intel-map';
import ChartsPanel from './charts-panel';
import AnalysisPanel from './analysis-panel';
import PdfReportButton from './pdf-report';
import WelcomeScreen from './welcome-screen';
import { Menu, X } from 'lucide-react';

export default function Dashboard() {
  const { isDataLoaded } = useIntel();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isDataLoaded) {
    return <WelcomeScreen />;
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white">
      <Header />

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-16 left-2 z-40 lg:hidden bg-[#111827] border border-cyan-900/30 text-cyan-400 p-2 rounded-lg"
      >
        {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      <div className="flex pt-14">
        {/* Sidebar izquierda */}
        <aside className="hidden lg:block sticky top-14 left-0 z-30 h-[calc(100vh-3.5rem)] w-80 bg-[#0A0F1C] border-r border-cyan-900/20 flex-shrink-0 overflow-y-auto">
          <div className="p-3 border-b border-cyan-900/20 flex items-center justify-between">
            <span className="text-cyan-400 text-[11px] font-bold tracking-widest">PANEL DE CONTROL</span>
            <PdfReportButton />
          </div>
          <div className="p-3">
            <StatsSidebar />
          </div>
        </aside>

        {sidebarOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <aside className="fixed top-14 left-0 z-50 h-[calc(100vh-3.5rem)] w-80 max-w-[85vw] bg-[#0A0F1C] border-r border-cyan-900/20 lg:hidden overflow-y-auto">
              <div className="p-3 border-b border-cyan-900/20 flex items-center justify-between">
                <span className="text-cyan-400 text-xs font-bold tracking-widest">PANEL DE CONTROL</span>
                <div className="flex items-center gap-2">
                  <PdfReportButton />
                  <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-cyan-400 p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <StatsSidebar />
              </div>
            </aside>
          </>
        )}

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 min-w-0 overflow-y-auto" style={{ height: 'calc(100vh - 3.5rem)' }}>
          <div className="p-2">
            
            {/* GRÁFICOS - ARRIBA (más altura para mejor visualización) */}
            <div className="bg-[#0F1422] rounded-xl border border-cyan-900/20 overflow-hidden mb-5">
              <div className="p-3 border-b border-cyan-900/20 bg-[#0D1220]">
                <h2 className="text-sm font-semibold text-green-400 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  📊 DESGLOSE POR TIPOLOGÍA Y ESTRUCTURAS
                </h2>
              </div>
              <div className="p-4">
                <ChartsPanel />
              </div>
            </div>

            {/* MAPA + IA en dos columnas iguales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              {/* MAPA */}
              <div className="bg-[#0F1422] rounded-xl border border-cyan-900/20 overflow-hidden">
                <div className="p-3 border-b border-cyan-900/20 bg-[#0D1220]">
                  <h2 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                    🗺️ MAPA DE INCIDENTES
                  </h2>
                </div>
                <div className="p-3">
                  <div className="rounded-lg overflow-hidden bg-[#070B14]" style={{ height: '420px' }}>
                    <IntelMap />
                  </div>
                </div>
              </div>

              {/* ANÁLISIS IA */}
              <div className="bg-[#0F1422] rounded-xl border border-cyan-900/20 overflow-hidden">
                <div className="p-3 border-b border-cyan-900/20 bg-[#0D1220]">
                  <h2 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    🤖 ANÁLISIS IA - INTELIGENCIA PREDICTIVA
                  </h2>
                </div>
                <div className="p-4" style={{ height: '420px', overflowY: 'auto' }}>
                  <AnalysisPanel />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}