import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  Layers,
  Search,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';

export const GISSatelliteTracker: React.FC = () => {
  const {
    selectedGraveyard,
    currentBlocks,
    currentSlots,
    setSelectedBlockId,
    selectedSlotId,
    setSelectedSlotId,
    getSlotDeceasedHistory,
  } = useApp();

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [basemapType, setBasemapType] = useState<'satellite' | 'street'>('satellite');
  const [filterBlock, setFilterBlock] = useState<string>('all');
  const [slotSearch, setSlotSearch] = useState<string>('');
  const [statusFilter] = useState<'all' | 'Available' | 'Occupied' | 'Maturing_Cooldown'>('all');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const polygonLayersRef = useRef<L.Polygon[]>([]);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Filtered Slots for the ground matrix
  const visibleSlots = useMemo(() => {
    return currentSlots.filter((slot) => {
      const matchBlock = filterBlock === 'all' || slot.blockId === filterBlock;
      const matchStatus = statusFilter === 'all' || slot.currentStatus === statusFilter;
      const matchSearch =
        !slotSearch.trim() ||
        slot.slotNumber.toLowerCase().includes(slotSearch.trim().toLowerCase()) ||
        slot.id.toLowerCase().includes(slotSearch.trim().toLowerCase());

      return matchBlock && matchStatus && matchSearch;
    });
  }, [currentSlots, filterBlock, statusFilter, slotSearch]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const centerLat = selectedGraveyard?.coordinates.lat || 23.7485;
      const centerLng = selectedGraveyard?.coordinates.lng || 90.3582;

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 18,
        minZoom: 14,
        maxZoom: 20,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Switch Basemap Tile Layer
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let tileUrl =
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let attribution =
      'GIS Satellite &copy; Esri, Maxar, Earthstar Geographics, USDA, USGS, AeroGRID, IGN, and GIS User Community';
    let maxZoom = 20;

    if (basemapType === 'street') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
      maxZoom = 19;
    }

    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution,
      maxZoom,
      className: basemapType === 'street' && isDark ? 'leaflet-tile-invert' : '',
    }).addTo(map);

    // Re-center if graveyard changes
    if (selectedGraveyard) {
      map.flyTo([selectedGraveyard.coordinates.lat, selectedGraveyard.coordinates.lng], 18, {
        duration: 0.8,
      });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 150);
  }, [selectedGraveyard?.id, basemapType, isDark]);

  // Render Real GIS Boundary Polygons & Block Perimeters
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedGraveyard) return;

    // Clear old polygons
    polygonLayersRef.current.forEach((layer) => map.removeLayer(layer));
    polygonLayersRef.current = [];

    // 1. Municipal Cemetery Boundary GeoJSON Polygon
    if (selectedGraveyard.boundaryPolygon && selectedGraveyard.boundaryPolygon.length > 0) {
      const boundaryPoly = L.polygon(selectedGraveyard.boundaryPolygon, {
        color: '#10B981',
        weight: 2.5,
        opacity: 0.9,
        fillColor: '#059669',
        fillOpacity: basemapType === 'satellite' ? 0.08 : 0.12,
        dashArray: '6, 3',
      }).addTo(map);

      boundaryPoly.bindTooltip(
        `<strong>${selectedGraveyard.name}</strong><br/><span style="font-size:10px;color:#64748B;">Cadastral Boundary Perimeter</span>`,
        { sticky: true, className: 'municipal-gis-tooltip' }
      );

      polygonLayersRef.current.push(boundaryPoly);
    }

    // 2. Sector Blocks Geographic Perimeters
    currentBlocks.forEach((block) => {
      if (block.boundaryPolygon && block.boundaryPolygon.length > 0) {
        const isBlockSelected = filterBlock === block.id;
        const blockPoly = L.polygon(block.boundaryPolygon, {
          color: isBlockSelected ? '#38BDF8' : '#64748B',
          weight: isBlockSelected ? 2 : 1,
          opacity: isBlockSelected ? 0.95 : 0.6,
          fillColor: isBlockSelected ? '#0284C7' : '#334155',
          fillOpacity: isBlockSelected ? 0.15 : 0.05,
          dashArray: isBlockSelected ? undefined : '4, 4',
        }).addTo(map);

        blockPoly.bindTooltip(
          `<strong>${block.name}</strong><br/><span style="font-size:10px;">${block.rowCount}x${block.colCount} Ground Matrix</span>`,
          { sticky: true, className: 'municipal-gis-tooltip' }
        );

        blockPoly.on('click', () => {
          setFilterBlock(block.id);
          setSelectedBlockId(block.id);
        });

        polygonLayersRef.current.push(blockPoly);
      }
    });
  }, [selectedGraveyard, currentBlocks, filterBlock, basemapType]);

  // Render Dense Ground Matrix Plot Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!markersLayerRef.current) {
      markersLayerRef.current = L.layerGroup().addTo(map);
    }
    const layerGroup = markersLayerRef.current;
    layerGroup.clearLayers();

    visibleSlots.forEach((slot) => {
      if (!slot.coordinates) return;

      const isSelected = slot.id === selectedSlotId;
      const burials = getSlotDeceasedHistory(slot.id);
      const burialsCount = slot.totalBurialsCount || burials.length;

      // Status Styling for Dense Matrix
      let badgeBorder = 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200';
      let statusIndicator = '●';
      let statusColor = 'text-emerald-600';

      if (slot.currentStatus === 'Occupied') {
        badgeBorder =
          burialsCount >= 3
            ? 'border-slate-500 bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
            : 'border-slate-400 bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200';
        statusIndicator = burialsCount >= 3 ? '▲ L3' : `L${burialsCount}`;
        statusColor = 'text-slate-600 dark:text-slate-400 font-bold';
      } else if (slot.currentStatus === 'Maturing_Cooldown') {
        badgeBorder = 'border-amber-600 bg-amber-50 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200';
        statusIndicator = '⏳';
        statusColor = 'text-amber-600';
      }

      const selectedClass = isSelected
        ? 'ring-2 ring-sky-500 ring-offset-1 scale-110 z-50 font-black shadow-lg'
        : 'hover:scale-105 opacity-95';

      const alertDot = slot.highRiskAlert
        ? '<span class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-600 animate-ping"></span><span class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-600"></span>'
        : '';

      const markerHtml = `
        <div class="relative cursor-pointer transition-transform duration-150 select-none">
          <div class="flex items-center gap-1 px-1.5 py-0.5 rounded border ${badgeBorder} ${selectedClass} font-mono text-[9px] shadow-sm backdrop-blur-sm whitespace-nowrap">
            <span class="font-bold">${slot.slotNumber}</span>
            <span class="text-[8px] opacity-80 ${statusColor}">${statusIndicator}</span>
          </div>
          ${alertDot}
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'dense-ground-matrix-pin',
        iconSize: [44, 20],
        iconAnchor: [22, 10],
      });

      const marker = L.marker([slot.coordinates.lat, slot.coordinates.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 100,
      });

      marker.on('click', () => {
        setSelectedSlotId(slot.id);
        map.flyTo([slot.coordinates!.lat, slot.coordinates!.lng], Math.max(map.getZoom(), 18), {
          duration: 0.5,
        });
      });

      layerGroup.addLayer(marker);
    });
  }, [visibleSlots, selectedSlotId, getSlotDeceasedHistory]);

  const handleResetCenter = () => {
    if (!mapInstanceRef.current || !selectedGraveyard) return;
    mapInstanceRef.current.flyTo(
      [selectedGraveyard.coordinates.lat, selectedGraveyard.coordinates.lng],
      18,
      { duration: 0.7 }
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotSearch.trim()) return;

    const matched = currentSlots.find(
      (s) => s.slotNumber.toLowerCase() === slotSearch.trim().toLowerCase()
    );

    if (matched && matched.coordinates && mapInstanceRef.current) {
      setSelectedSlotId(matched.id);
      mapInstanceRef.current.flyTo([matched.coordinates.lat, matched.coordinates.lng], 19, {
        duration: 0.7,
      });
    }
  };

  return (
    <div className="relative w-full h-[640px] rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 overflow-hidden shadow-xl flex flex-col">
      {/* Top Administrative GIS Bar */}
      <div className="relative z-10 px-4 py-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Cadastral Boundary Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {selectedGraveyard?.name}
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                GeoJSON Perimeter Active
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
              {visibleSlots.length} Active Plots Shown • GIS Satellite Ground Matrix
            </p>
          </div>
        </div>

        {/* Center: Sector Block Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
          <button
            type="button"
            onClick={() => {
              setFilterBlock('all');
              setSelectedBlockId(currentBlocks[0]?.id || '');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              filterBlock === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Sectors
          </button>
          {currentBlocks.map((blk) => (
            <button
              key={blk.id}
              type="button"
              onClick={() => {
                setFilterBlock(blk.id);
                setSelectedBlockId(blk.id);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                filterBlock === blk.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {blk.name.split(' (')[0]}
            </button>
          ))}
        </div>

        {/* Right: Basemap Selector & Quick Search */}
        <div className="flex items-center gap-2">
          {/* Quick Plot Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Find plot (e.g. B-202)..."
              value={slotSearch}
              onChange={(e) => setSlotSearch(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 w-36 sm:w-44 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </form>

          {/* Basemap Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setBasemapType('satellite')}
              className={`px-2 py-1 rounded font-medium text-[11px] transition-colors ${
                basemapType === 'satellite'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              title="High-resolution Daytime Satellite Layer"
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setBasemapType('street')}
              className={`px-2 py-1 rounded font-medium text-[11px] transition-colors ${
                basemapType === 'street'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              title="Clean Vector OpenStreetMap Basemap"
            >
              Street
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetCenter}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 transition-colors"
            title="Recenter Map on Cemetery Center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className="relative flex-1 w-full h-full">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Dense Matrix Status Legend */}
        <div className="absolute bottom-4 left-4 z-10 px-3 py-2 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-lg text-[10px] font-mono space-y-1.5 pointer-events-auto">
          <div className="font-bold text-slate-700 dark:text-slate-200 text-[10px] font-sans pb-1 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <span>DENSE PLOT MATRIX</span>
            <span className="text-[9px] text-slate-400 font-mono">1:1 Cadastral</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded border border-emerald-600 bg-emerald-100 dark:bg-emerald-950 inline-block shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">Available / Ready</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded border border-amber-600 bg-amber-100 dark:bg-amber-950 inline-block shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">Bioclimatic Cooldown</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded border border-slate-500 bg-slate-200 dark:bg-slate-800 inline-block shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">Full Stack (3/3 Layers)</span>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-rose-600 dark:text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0 animate-pulse" />
            <span>14-Day Soil Settlement Alert</span>
          </div>
        </div>
      </div>
    </div>
  );
};
