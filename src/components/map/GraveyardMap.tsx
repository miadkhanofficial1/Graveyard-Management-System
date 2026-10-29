import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import type { Graveyard } from '../../types';
import { GoogleGraveyardMap } from './GoogleGraveyardMap';
import { Map as MapIcon, Globe, RotateCcw } from 'lucide-react';

interface GraveyardMapProps {
  graveyards: Graveyard[];
  selectedGraveyardId: string;
  onSelectGraveyard: (id: string) => void;
  onEnterTracker: (id: string) => void;
}

export const GraveyardMap: React.FC<GraveyardMapProps> = ({
  graveyards,
  selectedGraveyardId,
  onSelectGraveyard,
  onEnterTracker,
}) => {
  // Default to OpenStreetMap on initial load
  const [mapProvider, setMapProvider] = useState<'google' | 'leaflet'>('leaflet');
  const [googleLoadFailed, setGoogleLoadFailed] = useState(false);
  const [osmTileType, setOsmTileType] = useState<'street' | 'satellite'>('street');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  const { theme } = useTheme();
  const { blocks, showToast } = useApp();
  const isDark = theme === 'dark';

  // Handle Google Maps load error with automatic seamless fallback to OpenStreetMap
  const handleGoogleMapError = useCallback(
    (error: Error) => {
      console.warn('Google Maps API load issue. Seamlessly falling back to OpenStreetMap:', error.message);
      setGoogleLoadFailed(true);
      setMapProvider('leaflet');
      showToast({
        title: 'Switched to OpenStreetMap',
        message: 'Google Maps encountered an issue. OpenStreetMap is active without interruption.',
        type: 'info',
      });
    },
    [showToast]
  );

  // Invalidate Leaflet map size on provider change, container mount, or tile switch
  useEffect(() => {
    if (mapProvider === 'leaflet' && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 100);
    }
  }, [mapProvider, osmTileType]);

  // Delegated click listener for popup "Enter 2.5D View" and "Close" buttons
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const handleContainerClick = (e: MouseEvent) => {
      // Close popup action
      const closeTarget = (e.target as HTMLElement).closest<HTMLElement>('[data-action="close-popup"]');
      if (closeTarget) {
        e.preventDefault();
        e.stopPropagation();
        mapInstanceRef.current?.closePopup();
        return;
      }

      // Enter 2.5D View action
      const target = (e.target as HTMLElement).closest<HTMLElement>('[data-action="enter-tracker"]');
      if (target) {
        e.preventDefault();
        e.stopPropagation();
        const gyId = target.getAttribute('data-gyid');
        if (gyId) {
          onEnterTracker(gyId);
        }
      }
    };

    container.addEventListener('click', handleContainerClick);
    return () => {
      container.removeEventListener('click', handleContainerClick);
    };
  }, [onEnterTracker]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (mapProvider !== 'leaflet' || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center default on Dhaka (23.8103, 90.4125)
      const map = L.map(mapContainerRef.current, {
        center: [23.8103, 90.4125],
        zoom: 12,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove old tile layer
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    // Completely free, zero-API-key tile layers:
    // 1. Street: Standard OpenStreetMap
    // 2. Satellite: Esri World Imagery (Public domain, high-res, zero keys, no watermark)
    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution =
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    let subdomains: string | string[] = 'abc';
    let maxZoom = 19;

    if (osmTileType === 'satellite') {
      tileUrl =
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution =
        'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community';
      subdomains = [];
      maxZoom = 18;
    }

    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution,
      maxZoom,
      subdomains,
      className: osmTileType === 'satellite' ? 'leaflet-tile-natural' : '',
    }).addTo(map);

    // Refresh size
    setTimeout(() => {
      map.invalidateSize();
    }, 150);
  }, [mapProvider, osmTileType, isDark]);

  // Update Leaflet Markers
  useEffect(() => {
    if (mapProvider !== 'leaflet') return;
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    graveyards.forEach((gy) => {
      const isSelected = gy.id === selectedGraveyardId;
      const isPending = gy.status === 'Pending';
      const freeSlots = Math.max(0, gy.totalSlots - gy.occupiedSlots);
      const freePercent =
        gy.totalSlots > 0 ? Math.round((freeSlots / gy.totalSlots) * 100) : 0;
      const occupiedPercent =
        gy.totalSlots > 0 ? Math.round((gy.occupiedSlots / gy.totalSlots) * 100) : 0;

      const gyBlocks = blocks.filter((b) => b.graveyardId === gy.id);

      const pinGlow = isSelected
        ? 'ring-4 ring-accentEmerald ring-offset-2 scale-110 shadow-2xl'
        : 'hover:scale-105';

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        iconSize: [44, 52],
        iconAnchor: [22, 50],
        popupAnchor: [0, -48],
        html: `
          <div class="relative flex flex-col items-center cursor-pointer transition-all duration-200 ${pinGlow}">
            <div class="relative flex items-center justify-center w-10 h-10 rounded-2xl shadow-xl ${
              isPending ? 'bg-amber-500' : 'bg-emerald-600'
            } text-white font-bold text-xs border-2 border-white dark:border-slate-900">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
              <div class="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold shadow-sm ${
                isPending ? 'bg-amber-800 text-amber-100' : 'bg-slate-900 text-emerald-300'
              }">
                ${isPending ? 'P' : `${freePercent}%`}
              </div>
            </div>
            <div class="w-2.5 h-2.5 rotate-45 -mt-1 ${
              isPending ? 'bg-amber-500' : 'bg-emerald-600'
            } border-r border-b border-white dark:border-slate-900"></div>
          </div>
        `,
      });

      const marker = L.marker([gy.coordinates.lat, gy.coordinates.lng], {
        icon: customIcon,
      }).addTo(map);

      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${gy.coordinates.lat},${gy.coordinates.lng}&destination_place_id=${encodeURIComponent(
        gy.name
      )}`;

      const popupHtml = `
        <div class="w-72 p-4 rounded-[24px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-white/40 dark:border-white/15 shadow-[0_12px_36px_rgba(0,0,0,0.3)] text-slate-900 dark:text-white font-sans">
          <div class="flex items-start justify-between gap-2 mb-2">
            <div>
              <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isPending
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
              }">
                ${gy.status === 'Approved' ? 'Verified Municipal' : 'Pending Review'}
              </span>
              <h4 class="text-sm font-bold text-slate-900 dark:text-white leading-tight mt-1.5">
                ${gy.name}
              </h4>
            </div>

            <button type="button"
                    data-action="close-popup"
                    class="w-6 h-6 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center text-xs font-bold transition-all cursor-pointer shrink-0"
                    title="Close details popup"
                    aria-label="Close">
              ✕
            </button>
          </div>

          <p class="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-start gap-1">
            📍 ${gy.address}, ${gy.district}
          </p>

          <div class="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 mb-3 space-y-2 text-xs backdrop-blur-md">
            <div class="flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400">Total Sectors:</span>
              <span class="font-semibold">${gyBlocks.length || 1} Blocks</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400">Available Plots:</span>
              <span class="font-bold text-emerald-600 dark:text-emerald-400">${freeSlots} Slots (${freePercent}%)</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400">Occupancy:</span>
              <span class="font-bold text-slate-700 dark:text-slate-300">${gy.occupiedSlots} / ${gy.totalSlots} (${occupiedPercent}%)</span>
            </div>
            <div class="w-full h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
              <div class="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full" style="width: ${occupiedPercent}%"></div>
            </div>
          </div>

          <div class="flex gap-2">
            <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer"
               class="flex-1 py-2 px-3 rounded-full bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 border border-black/5 dark:border-white/10 text-sky-600 dark:text-sky-400 font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all text-center">
              <span>Directions</span>
              <span>↗</span>
            </a>

            <button type="button"
                    data-action="enter-tracker"
                    data-gyid="${gy.id}"
                    id="btn-enter-${gy.id}"
                    class="flex-[1.2] py-2 px-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 text-white font-bold text-xs tracking-wide shadow-[0_4px_14px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <span>Enter 2.5D View</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 300,
        autoPan: true,
        autoPanPadding: [20, 20],
        closeButton: false,
      });

      marker.on('click', () => {
        onSelectGraveyard(gy.id);
      });

      markersRef.current[gy.id] = marker;
    });
  }, [
    mapProvider,
    graveyards,
    selectedGraveyardId,
    blocks,
    onSelectGraveyard,
    onEnterTracker,
  ]);

  // Leaflet Pan
  useEffect(() => {
    if (mapProvider !== 'leaflet') return;
    const map = mapInstanceRef.current;
    if (!map || !selectedGraveyardId) return;

    const target = graveyards.find((g) => g.id === selectedGraveyardId);
    if (target) {
      map.flyTo([target.coordinates.lat, target.coordinates.lng], 14, {
        duration: 1.2,
      });

      const marker = markersRef.current[target.id];
      if (marker && !marker.isPopupOpen()) {
        setTimeout(() => {
          marker.openPopup();
        }, 600);
      }
    }
  }, [mapProvider, selectedGraveyardId, graveyards]);

  // Reset Leaflet to Dhaka
  const handleResetDhaka = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([23.8103, 90.4125], 12, { duration: 1.0 });
    }
  };

  return (
    <div className="relative z-0 isolate w-full h-full min-h-[500px]">
      {/* Map Provider Selector Header Badge (iOS Floating Glass Capsule) */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        <div className="flex items-center p-1 rounded-full bg-white/75 dark:bg-slate-900/75 backdrop-blur-2xl border border-white/50 dark:border-white/15 shadow-[0_8px_24px_rgba(0,0,0,0.18)] text-[10px] font-bold">
          <button
            onClick={() => setMapProvider('leaflet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${
              mapProvider === 'leaflet'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapIcon className="w-3 h-3" />
            <span>OpenStreetMap</span>
            <span className="hidden sm:inline text-[9px] opacity-80 font-normal">(Default)</span>
          </button>

          <button
            onClick={() => setMapProvider('google')}
            disabled={googleLoadFailed}
            title={
              googleLoadFailed
                ? 'Google Maps unavailable'
                : 'Switch to Google Maps (Satellite & Places Search)'
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${
              mapProvider === 'google'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Google Maps</span>
            {googleLoadFailed && (
              <span className="text-[9px] text-amber-500 font-semibold">(Offline)</span>
            )}
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE ENGINE */}
      {mapProvider === 'google' && !googleLoadFailed ? (
        <GoogleGraveyardMap
          graveyards={graveyards}
          selectedGraveyardId={selectedGraveyardId}
          onSelectGraveyard={onSelectGraveyard}
          onEnterTracker={onEnterTracker}
          onError={handleGoogleMapError}
        />
      ) : (
        <div className="relative w-full h-full min-h-[500px] overflow-hidden">
          {/* Leaflet Map Container with conditional dark mode tile filter */}
          <div
            ref={mapContainerRef}
            className={`w-full h-full min-h-[500px] ${
              isDark && osmTileType === 'street' ? 'leaflet-osm-dark' : ''
            }`}
          />

          {/* Leaflet Sub-style controls (iOS VisionOS Glass Capsule Controls) */}
          <div className="absolute bottom-5 left-4 z-10 flex items-center gap-2">
            <div className="flex items-center p-1 rounded-full bg-white/75 dark:bg-slate-900/75 backdrop-blur-2xl border border-white/50 dark:border-white/15 shadow-[0_8px_24px_rgba(0,0,0,0.18)] text-[11px] font-bold">
              <button
                onClick={() => setOsmTileType('street')}
                className={`px-3 py-1 rounded-full transition-all duration-200 ${
                  osmTileType === 'street'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Roadmap
              </button>

              <button
                onClick={() => setOsmTileType('satellite')}
                className={`px-3 py-1 rounded-full transition-all duration-200 ${
                  osmTileType === 'satellite'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Satellite
              </button>
            </div>

            <button
              onClick={handleResetDhaka}
              className="px-3 py-1.5 rounded-full bg-white/75 dark:bg-slate-900/75 backdrop-blur-2xl border border-white/50 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:text-emerald-500 shadow-[0_8px_24px_rgba(0,0,0,0.18)] text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 active:scale-95"
              title="Reset View to Dhaka Metropolitan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Dhaka</span>
            </button>
          </div>

          {googleLoadFailed && (
            <div className="absolute bottom-5 right-4 z-10 px-3 py-1.5 rounded-full bg-amber-500/80 text-white text-[11px] font-semibold backdrop-blur-xl shadow-lg flex items-center gap-1.5">
              <span>Running on OpenStreetMap (Offline)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
