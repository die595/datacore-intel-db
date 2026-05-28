'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useIntel } from '@/contexts/intel-context';

const TIPOLOGIA_COLORS: Record<string, string> = {
  'CAPTURA PERSONA': '#FF4444',
  'NARCOTRÁFICO': '#FF9149',
  'TERRORISMO': '#FF0066',
  'EIYM': '#FFD700',
  'ARTEFACTO EXPLOSIVO': '#FF6363',
  'ABIGEATO': '#80D8C3',
  'EXTORSION': '#A19AD3',
  'HOMICIDIO': '#FF90BB',
  'default': '#FF4444',
};

function getColor(tipologia: string): string {
  const t = (tipologia ?? '').trim().toUpperCase();
  for (const [key, color] of Object.entries(TIPOLOGIA_COLORS ?? {})) {
    if (t.includes(key.toUpperCase())) return color;
  }
  return TIPOLOGIA_COLORS['default'] ?? '#FF4444';
}

export default function MapInner() {
  const mapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const { filteredRecords, isDataLoaded } = useIntel();

  // Initialize map
  useEffect(() => {
    if (!containerRef?.current || mapRef?.current) return;
    let cancelled = false;

    async function initMap() {
      const leafletModule = await import('leaflet');
      const L = leafletModule.default || leafletModule;

      if (cancelled || !containerRef.current) return;

      // Add CSS if not present
      if (!document.querySelector('link[data-leaflet-css]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.setAttribute('data-leaflet-css', 'true');
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const map = L.map(containerRef.current, {
        center: [7.5, -75.5],
        zoom: 8,
        zoomControl: true,
        attributionControl: false,
        preferCanvas: true, // Use canvas for better performance with many markers
      });

      const tileUrl = ['https:/', '/{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'].join('');
      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      mapRef.current = map;
      leafletRef.current = L;
      setMapReady(true);
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        leafletRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    const map = mapRef?.current;
    const L = leafletRef?.current;
    if (!map || !L || !mapReady) return;

    // Remove previous markers layer
    if (markersLayerRef?.current) {
      map.removeLayer(markersLayerRef.current);
    }

    const layerGroup = L.layerGroup();
    const safeRecords = filteredRecords ?? [];

    for (const record of safeRecords) {
      const lat = record?.latitud;
      const lon = record?.longitud;
      if (lat == null || lon == null || isNaN(lat) || isNaN(lon)) continue;
      if (lat === 0 && lon === 0) continue;

      const color = getColor(record?.tipologia ?? '');

      const circle = L.circleMarker([lat, lon], {
        radius: 5,
        fillColor: color,
        color: color,
        weight: 1,
        opacity: 0.9,
        fillOpacity: 0.7,
      });

      circle.bindPopup(
        `<div style="font-family:'DM Sans',sans-serif;color:#e2e8f0;background:#111827;padding:10px;border-radius:8px;min-width:220px;border:1px solid rgba(0,217,255,0.3);">
          <div style="color:#00D9FF;font-weight:bold;font-size:13px;margin-bottom:6px;">${record?.municipio ?? 'N/A'}</div>
          <div style="font-size:11px;color:#94a3b8;margin-bottom:3px;"><b>Fecha:</b> ${record?.fecha ?? 'N/A'}</div>
          <div style="font-size:11px;color:#94a3b8;margin-bottom:3px;"><b>Tipología:</b> ${record?.tipologia ?? 'N/A'}</div>
          <div style="font-size:11px;color:#94a3b8;margin-bottom:3px;"><b>Fenómeno:</b> ${(record?.fenomenoCriminalidad ?? 'N/A').substring(0, 80)}</div>
          <div style="font-size:11px;color:#94a3b8;margin-bottom:3px;"><b>Estructura:</b> ${(record?.estructura ?? 'N/A').substring(0, 60)}</div>
          <div style="font-size:11px;color:#94a3b8;margin-bottom:3px;"><b>Departamento:</b> ${record?.departamento ?? 'N/A'}</div>
          <div style="font-size:10px;color:#64748b;margin-top:5px;max-height:70px;overflow-y:auto;line-height:1.4;">${(record?.informacionHecho ?? '').substring(0, 250)}${(record?.informacionHecho?.length ?? 0) > 250 ? '...' : ''}</div>
        </div>`,
        { className: 'dark-popup', maxWidth: 320 }
      );

      layerGroup.addLayer(circle);
    }

    layerGroup.addTo(map);
    markersLayerRef.current = layerGroup;

    // Fit bounds to data
    if ((safeRecords?.length ?? 0) > 0) {
      const validCoords = safeRecords
        .filter((r: any) => r?.latitud && r?.longitud && !isNaN(r.latitud) && !isNaN(r.longitud) && !(r.latitud === 0 && r.longitud === 0))
        .map((r: any) => [r.latitud, r.longitud] as [number, number]);
      if ((validCoords?.length ?? 0) > 0) {
        try {
          map.fitBounds(L.latLngBounds(validCoords), { padding: [30, 30], maxZoom: 12 });
        } catch { /* ignore */ }
      }
    }
  }, [filteredRecords, mapReady]);

  return (
    <div className="w-full h-full relative">
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0A0F1C] z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-cyan-400 font-mono text-sm">CARGANDO MAPA...</p>
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
      <style jsx global>{`
        .leaflet-popup-content-wrapper { background: transparent !important; box-shadow: none !important; padding: 0 !important; }
        .leaflet-popup-tip { background: #111827 !important; }
        .leaflet-popup-content { margin: 0 !important; }
        .leaflet-control-zoom a { background: #111827 !important; color: #00D9FF !important; border-color: rgba(0,217,255,0.3) !important; }
        .leaflet-control-zoom a:hover { background: #1a2332 !important; }
      `}</style>
    </div>
  );
}
