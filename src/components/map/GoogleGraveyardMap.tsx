import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import type { Graveyard } from '../../types';
import { loadGoogleMaps } from '../../services/googleMapsLoader';
import {
  MapPin,
  Search,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface GoogleGraveyardMapProps {
  graveyards: Graveyard[];
  selectedGraveyardId: string;
  onSelectGraveyard: (id: string) => void;
  onEnterTracker: (id: string) => void;
  onError?: (err: Error) => void;
}

// Google Maps Dark Mode Style
const darkMapStyle: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#064e3b' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#10b981' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#334155' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94a3b8' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#334155' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f59e0b' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94a3b8' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0c2238' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#0c2238' }],
  },
];

// Google Maps Light Mode Style
const lightMapStyle: google.maps.MapTypeStyle[] = [
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#e0f2fe' }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#f8fafc' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#dcfce7' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#e2e8f0' }],
  },
  {
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#475569' }],
  },
];

export const GoogleGraveyardMap: React.FC<GoogleGraveyardMapProps> = ({
  graveyards,
  selectedGraveyardId,
  onSelectGraveyard,
  onEnterTracker,
  onError,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<{ [key: string]: google.maps.Marker }>({});
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const searchLocationMarkerRef = useRef<google.maps.Marker | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchPlaceName, setSearchPlaceName] = useState('');
  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');

  const { theme } = useTheme();
  const { blocks } = useApp();
  const isDark = theme === 'dark';

  // Helper to create custom styled SVG pin icon
  const createPinIcon = useCallback(
    (isSelected: boolean, isPending: boolean, freePercent: number): google.maps.Icon => {
      const fillColor = isPending ? '#f59e0b' : '#059669';
      const strokeColor = isSelected ? '#34d399' : '#ffffff';
      const strokeWidth = isSelected ? 3 : 2;
      const scale = isSelected ? 1.15 : 1.0;

      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="46" height="56" viewBox="0 0 46 56">
          <defs>
            <filter id="pinShadow" x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="0" dy="3" stdDeviation="3.5" flood-color="#000000" flood-opacity="0.4"/>
            </filter>
          </defs>
          <g filter="url(#pinShadow)">
            <!-- Teardrop Pin Body -->
            <path d="M23 2 C13 2 5 10 5 21 C5 33 21 49 23 51 C25 49 41 33 41 21 C41 10 33 2 23 2 Z" 
                  fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
            <!-- Inner Center Disc -->
            <circle cx="23" cy="21" r="11" fill="#ffffff" />
            <!-- Islamic / Memorial Tiered Layer Icon -->
            <path d="M23 14 L29 18 L23 22 L17 18 Z M17 22 L23 26 L29 22" 
                  fill="none" stroke="${fillColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            <!-- Capacity Pill Badge -->
            <rect x="25" y="4" width="18" height="13" rx="6.5" fill="#0f172a" stroke="#ffffff" stroke-width="1.2" />
            <text x="34" y="13.5" font-size="7.5" font-family="system-ui, -apple-system, sans-serif" font-weight="800" fill="${isPending ? '#f59e0b' : '#34d399'}" text-anchor="middle">
              ${isPending ? 'P' : `${freePercent}%`}
            </text>
          </g>
        </svg>
      `;

      return {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
        scaledSize: new google.maps.Size(46 * scale, 56 * scale),
        anchor: new google.maps.Point(23 * scale, 51 * scale),
      };
    },
    []
  );

  // Initialize Google Maps instance
  useEffect(() => {
    let isMounted = true;

    // Intercept Google Maps API console errors (e.g. ApiNotActivatedMapError, BillingNotEnabledMapError)
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      originalConsoleError(...args);
      const msg = args.map((a) => String(a)).join(' ');
      if (
        msg.includes('Google Maps JavaScript API error') ||
        msg.includes('ApiNotActivatedMapError') ||
        msg.includes('BillingNotEnabledMapError') ||
        msg.includes('InvalidKeyMapError')
      ) {
        if (isMounted && onError) {
          onError(new Error(msg));
        }
      }
    };

    // Attach gm_authFailure handler to catch key / quota restrictions
    const prevAuthFailure = (window as unknown as { gm_authFailure?: () => void }).gm_authFailure;
    (window as unknown as { gm_authFailure?: () => void }).gm_authFailure = () => {
      console.warn('Google Maps API authentication failed. Triggering automatic OpenStreetMap fallback.');
      if (isMounted && onError) {
        onError(new Error('Google Maps API authentication failed or key quota exceeded.'));
      }
      if (prevAuthFailure) prevAuthFailure();
    };

    loadGoogleMaps()
      .then((gMaps) => {
        if (!isMounted || !mapContainerRef.current) return;

        if (!mapInstanceRef.current) {
          // Center on Dhaka, Bangladesh (23.8103, 90.4125)
          const map = new gMaps.maps.Map(mapContainerRef.current, {
            center: { lat: 23.8103, lng: 90.4125 },
            zoom: 12,
            mapTypeId: 'roadmap',
            disableDefaultUI: false,
            zoomControl: true,
            zoomControlOptions: {
              position: gMaps.maps.ControlPosition.RIGHT_BOTTOM,
            },
            streetViewControl: false,
            fullscreenControl: true,
            mapTypeControl: false,
            styles: isDark ? darkMapStyle : lightMapStyle,
          });

          mapInstanceRef.current = map;
          infoWindowRef.current = new gMaps.maps.InfoWindow();

          // Initialize Places Autocomplete
          if (searchInputRef.current) {
            const autocomplete = new gMaps.maps.places.Autocomplete(
              searchInputRef.current,
              {
                componentRestrictions: { country: 'bd' },
                fields: ['geometry', 'name', 'formatted_address'],
              }
            );

            autocomplete.bindTo('bounds', map);

            autocomplete.addListener('place_changed', () => {
              const place = autocomplete.getPlace();
              if (!place.geometry || !place.geometry.location) return;

              map.panTo(place.geometry.location);
              map.setZoom(15);
              setSearchPlaceName(place.name || place.formatted_address || '');

              // Place interactive search marker
              if (searchLocationMarkerRef.current) {
                searchLocationMarkerRef.current.setMap(null);
              }

              searchLocationMarkerRef.current = new gMaps.maps.Marker({
                position: place.geometry.location,
                map,
                title: place.name || 'Searched Location',
                animation: gMaps.maps.Animation.DROP,
              });
            });

            autocompleteRef.current = autocomplete;
          }
        }

        setMapLoaded(true);
      })
      .catch((err) => {
        console.error('Failed to load Google Maps JS API:', err);
        if (isMounted) {
          setLoadError(err.message || 'Unable to connect to Google Maps service.');
          if (onError) onError(err);
        }
      });

    return () => {
      isMounted = false;
      console.error = originalConsoleError;
      (window as unknown as { gm_authFailure?: () => void }).gm_authFailure = prevAuthFailure;
    };
  }, [isDark, onError]);

  // Delegated click listener for popup "Enter 2.5D View" button
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const handleContainerClick = (e: MouseEvent) => {
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

  // Update theme styles on theme change
  useEffect(() => {
    if (mapInstanceRef.current && mapLoaded) {
      mapInstanceRef.current.setOptions({
        styles: isDark ? darkMapStyle : lightMapStyle,
      });
    }
  }, [isDark, mapLoaded]);

  // Update Map Type (Roadmap vs Satellite)
  useEffect(() => {
    if (mapInstanceRef.current && mapLoaded) {
      mapInstanceRef.current.setMapTypeId(mapTypeId);
    }
  }, [mapTypeId, mapLoaded]);

  // Generate InfoWindow HTML
  const generateInfoWindowContent = useCallback(
    (gy: Graveyard) => {
      const isPending = gy.status === 'Pending';
      const freeSlots = Math.max(0, gy.totalSlots - gy.occupiedSlots);
      const freePercent =
        gy.totalSlots > 0 ? Math.round((freeSlots / gy.totalSlots) * 100) : 0;
      const occupiedPercent =
        gy.totalSlots > 0 ? Math.round((gy.occupiedSlots / gy.totalSlots) * 100) : 0;
      const gyBlocks = blocks.filter((b) => b.graveyardId === gy.id);

      // Google Maps Direct Route Navigation URL
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${gy.coordinates.lat},${gy.coordinates.lng}&destination_place_id=${encodeURIComponent(
        gy.name
      )}`;

      return `
        <div style="font-family: system-ui, -apple-system, sans-serif; width: 280px; padding: 4px; color: ${
          isDark ? '#f8fafc' : '#0f172a'
        };">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <div>
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: ${
                isPending ? '#f59e0b' : '#059669'
              };">
                ${isPending ? 'Pending Accreditation' : 'Verified Municipal Facility'}
              </span>
              <h4 style="font-size: 14px; font-weight: 800; line-height: 1.25; margin: 3px 0 0 0;">
                ${gy.name}
              </h4>
            </div>
          </div>

          <p style="font-size: 11px; color: ${
            isDark ? '#94a3b8' : '#64748b'
          }; margin: 0 0 10px 0; display: flex; align-items: center; gap: 4px;">
            <span>📍</span>
            <span>${gy.address}, ${gy.district}</span>
          </p>

          <div style="padding: 10px; border-radius: 12px; background: ${
            isDark ? 'rgba(30, 41, 59, 0.7)' : '#f1f5f9'
          }; margin-bottom: 12px; font-size: 11px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: ${isDark ? '#94a3b8' : '#64748b'};">Sectors / Blocks:</span>
              <span style="font-weight: 700;">${gyBlocks.length || 1} Blocks</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: ${isDark ? '#94a3b8' : '#64748b'};">Available Plots:</span>
              <span style="font-weight: 700; color: #059669;">${freeSlots} Plots (${freePercent}%)</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: ${isDark ? '#94a3b8' : '#64748b'};">Occupancy:</span>
              <span style="font-weight: 800; color: #059669;">
                ${gy.occupiedSlots} / ${gy.totalSlots} (${occupiedPercent}%)
              </span>
            </div>
            <div style="width: 100%; height: 6px; border-radius: 999px; background: ${
              isDark ? '#334155' : '#e2e8f0'
            }; overflow: hidden;">
              <div style="width: ${occupiedPercent}%; height: 100%; background: #059669; border-radius: 999px;"></div>
            </div>
          </div>

          <div style="display: flex; gap: 8px;">
            <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer"
               style="flex: 1; padding: 8px 10px; border-radius: 10px; background: #0284c7; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
              <span>Get Directions</span>
              <span>↗</span>
            </a>

            <button id="btn-gmap-enter-${gy.id}"
                    data-action="enter-tracker"
                    data-gyid="${gy.id}"
                    style="flex: 1.2; padding: 8px 10px; border-radius: 10px; background: #059669; color: #ffffff; border: none; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
              <span>Enter 2.5D View</span>
              <span>→</span>
            </button>
          </div>
        </div>
      `;
    },
    [isDark, blocks]
  );

  // Render & Synchronize Markers
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const infoWindow = infoWindowRef.current;

    // Clear old markers
    Object.values(markersRef.current).forEach((marker) => marker.setMap(null));
    markersRef.current = {};

    graveyards.forEach((gy) => {
      const isSelected = gy.id === selectedGraveyardId;
      const isPending = gy.status === 'Pending';
      const freeSlots = Math.max(0, gy.totalSlots - gy.occupiedSlots);
      const freePercent =
        gy.totalSlots > 0 ? Math.round((freeSlots / gy.totalSlots) * 100) : 0;

      const marker = new google.maps.Marker({
        position: { lat: gy.coordinates.lat, lng: gy.coordinates.lng },
        map,
        title: gy.name,
        icon: createPinIcon(isSelected, isPending, freePercent),
        zIndex: isSelected ? 999 : 10,
      });

      marker.addListener('click', () => {
        onSelectGraveyard(gy.id);

        if (infoWindow) {
          infoWindow.setContent(generateInfoWindowContent(gy));
          infoWindow.open(map, marker);

          // Add click listener for internal button after DOM insertion
          setTimeout(() => {
            const btn = document.getElementById(`btn-gmap-enter-${gy.id}`);
            if (btn) {
              btn.onclick = () => onEnterTracker(gy.id);
            }
          }, 150);
        }
      });

      markersRef.current[gy.id] = marker;
    });
  }, [
    mapLoaded,
    graveyards,
    selectedGraveyardId,
    createPinIcon,
    generateInfoWindowContent,
    onSelectGraveyard,
    onEnterTracker,
  ]);

  // Pan to selected graveyard
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !selectedGraveyardId) return;
    const map = mapInstanceRef.current;
    const target = graveyards.find((g) => g.id === selectedGraveyardId);

    if (target) {
      map.panTo({ lat: target.coordinates.lat, lng: target.coordinates.lng });
      map.setZoom(15);

      const marker = markersRef.current[target.id];
      const infoWindow = infoWindowRef.current;

      if (marker && infoWindow) {
        infoWindow.setContent(generateInfoWindowContent(target));
        infoWindow.open(map, marker);

        setTimeout(() => {
          const btn = document.getElementById(`btn-gmap-enter-${target.id}`);
          if (btn) {
            btn.onclick = () => onEnterTracker(target.id);
          }
        }, 150);
      }
    }
  }, [selectedGraveyardId, mapLoaded, graveyards, generateInfoWindowContent, onEnterTracker]);

  // Reset to National / Dhaka Overview
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: 23.8103, lng: 90.4125 });
      mapInstanceRef.current.setZoom(12);
      if (searchLocationMarkerRef.current) {
        searchLocationMarkerRef.current.setMap(null);
      }
      setSearchPlaceName('');
      if (searchInputRef.current) searchInputRef.current.value = '';
    }
  };

  if (loadError) {
    return (
      <div className="w-full h-full min-h-[480px] rounded-2xl flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <MapPin className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
          Google Maps Connection Issue
        </h4>
        <p className="text-xs text-slate-500 max-w-sm">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="relative z-0 isolate w-full h-full min-h-[500px] rounded-[28px] overflow-hidden border border-white/30 dark:border-white/10 shadow-inner">
      {/* Dynamic Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px]" />

      {/* Floating Google Places Search Autocomplete Overlay */}
      <div className="absolute top-3 left-3 right-3 sm:left-4 sm:right-auto sm:w-96 z-10 space-y-2">
        <div className="relative flex items-center shadow-xl rounded-full bg-white/75 dark:bg-slate-900/75 backdrop-blur-2xl border border-white/50 dark:border-white/15 transition-all">
          <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-4 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search location (e.g. Banani, Uttara)..."
            className="w-full pl-11 pr-24 py-2 text-xs bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none rounded-full font-medium"
          />
          <div className="absolute right-3 flex items-center gap-1.5 pointer-events-none">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 bg-white/40 dark:bg-white/5 px-2 py-0.5 rounded-full border border-white/30 dark:border-white/10 backdrop-blur-md">
              <Sparkles className="w-2.5 h-2.5 text-accentEmerald" /> Places
            </span>
          </div>
        </div>

        {searchPlaceName && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-semibold shadow-lg backdrop-blur-md border border-white/20">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[240px]">{searchPlaceName}</span>
            <button
              onClick={() => {
                setSearchPlaceName('');
                if (searchLocationMarkerRef.current) {
                  searchLocationMarkerRef.current.setMap(null);
                }
              }}
              className="ml-1 hover:text-emerald-200 font-bold"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Floating Map Controls (Map Type & Center Reset) */}
      <div className="absolute bottom-6 left-4 z-10 flex flex-wrap items-center gap-2">
        <div className="flex items-center p-1 rounded-full bg-white/75 dark:bg-slate-900/75 backdrop-blur-2xl border border-white/50 dark:border-white/15 shadow-xl text-[11px] font-bold">
          <button
            onClick={() => setMapTypeId('roadmap')}
            className={`px-3 py-1 rounded-full transition-all duration-200 ${
              mapTypeId === 'roadmap'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Vector Map
          </button>
          <button
            onClick={() => setMapTypeId('satellite')}
            className={`px-3 py-1 rounded-full transition-all duration-200 ${
              mapTypeId === 'satellite'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapTypeId('hybrid')}
            className={`px-3 py-1 rounded-full transition-all duration-200 ${
              mapTypeId === 'hybrid'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Hybrid
          </button>
        </div>

        <button
          onClick={handleResetView}
          className="px-3.5 py-1.5 rounded-full bg-white/75 dark:bg-slate-900/75 backdrop-blur-2xl border border-white/50 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:text-accentEmerald shadow-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 active:scale-95"
          title="Reset View to Dhaka Metropolitan"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Dhaka</span>
        </button>
      </div>

      {/* Powered by Google Maps Badge */}
      <div className="absolute top-3 right-3 z-10 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/75 dark:bg-slate-900/75 backdrop-blur-2xl border border-white/50 dark:border-white/15 text-[10px] font-semibold text-slate-600 dark:text-slate-300 shadow-md">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
        <span>Google Maps API</span>
      </div>
    </div>
  );
};
