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
import { Menu, X, Map, BarChart3, Brain, LayoutList } from 'lucide-react';

type TabKey = 'map' | 'stats' | 'charts' | 'analysis';

export default function Dashboard() {
  const { isDataLoaded } = useIntel();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('map');

  if (!isDataLoaded) {
    return <WelcomeScreen />;
  }

  const tabs = [
    { key: 'map' as TabKey, label: 'Mapa', icon: Map },
    { key: 'stats' as TabKey, label: 'Estadísticas', icon: LayoutList, mobileOnly: true },
    { key: 'charts' as TabKey, label: 'Gráficos', icon: BarChart3 },
    { key: 'analysis' as TabKey, label: 'Análisis IA', icon: Brain },
  ];

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white">
      <Header />

      {/* Mobile sidebar toggle - only on large screens */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-16 left-2 z-40 hidden lg:hidden bg-[#111827] border border-cyan-900/30 text-cyan-400 p-2 rounded-lg"
      >
        {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      <div className="flex pt-14">
        {/* Desktop Sidebar - hidden on mobile */}
        <aside className="hidden lg:block sticky top-14 left-0 z-30 h-[calc(100vh-3.5rem)] w-72 bg-[#0A0F1C] border-r border-cyan-900/20 flex-shrink-0">
          <div className="p-2 border-b border-cyan-900/20 flex items-center justify-between">
            <span className="text-cyan-400 text-[10px] font-bold tracking-widest">PANEL DE CONTROL</span>
            <PdfReportButton />
          </div>
          <div className="h-[calc(100%-2.5rem)] overflow-y-auto scrollbar-hide">
            <StatsSidebar />
          </div>
        </aside>

        {/* Mobile overlay sidebar */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="fixed top-14 left-0 z-50 h-[calc(100vh-3.5rem)] w-80 max-w-[85vw] bg-[#0A0F1C] border-r border-cyan-900/20 lg:hidden overflow-hidden">
              <div className="p-3 border-b border-cyan-900/20 flex items-center justify-between">
                <span className="text-cyan-400 text-xs font-bold tracking-widest">PANEL DE CONTROL</span>
                <div className="flex items-center gap-2">
                  <PdfReportButton />
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-400 hover:text-cyan-400 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="h-[calc(100%-3rem)] overflow-y-auto scrollbar-hide">
                <StatsSidebar />
              </div>
            </aside>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Tab navigation */}
          <div className="flex items-center gap-1 px-2 pt-2 pb-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab: any) => (
              <button
                key={tab.key}
                onClick={() => {
                  if (tab.key === 'stats') {
                    setSidebarOpen(true);
                  } else {
                    setActiveTab(tab.key);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                  tab.mobileOnly ? 'lg:hidden' : ''
                } ${
                  tab.key === 'stats'
                    ? sidebarOpen
                      ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-600/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
                    : activeTab === tab.key
                      ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-600/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'map' && (
            <div className="px-2 pb-2">
              <div className="rounded-lg overflow-hidden border border-cyan-900/20" style={{ height: 'calc(100vh - 8rem)' }}>
                <IntelMap />
              </div>
            </div>
          )}

          {activeTab === 'charts' && (
            <div className="pb-2">
              <ChartsPanel />
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="pb-2">
              <AnalysisPanel />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
