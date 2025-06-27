import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import styled from 'styled-components';
import L from 'leaflet';
import { GpxTrack, Theme } from '../types';

// 修正Leaflet默認圖標問題
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// 自定義起點和終點圖標
const startIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'start-marker'
});

const endIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'end-marker'
});

const MapWrapper = styled.div<{ $theme: Theme }>`
  flex: 1;
  height: 100vh;
  background-color: ${props => props.$theme.colors.background};
  
  .leaflet-container {
    height: 100%;
    width: 100%;
  }
  
  .leaflet-control-layers,
  .leaflet-control-zoom {
    background-color: ${props => props.$theme.colors.surface};
    border: 1px solid ${props => props.$theme.colors.border};
    
    a {
      background-color: ${props => props.$theme.colors.surface};
      color: ${props => props.$theme.colors.text};
      
      &:hover {
        background-color: ${props => props.$theme.colors.background};
      }
    }
  }
  
  /* 起點和終點標記樣式 */
  .start-marker {
    filter: hue-rotate(120deg); /* 綠色起點 */
  }
  
  .end-marker {
    filter: hue-rotate(0deg); /* 紅色終點 */
  }
  
  /* 軌跡tooltip樣式 */
  .track-tooltip {
    .leaflet-popup-content-wrapper {
      background-color: ${props => props.$theme.colors.surface} !important;
      border: 1px solid ${props => props.$theme.colors.border} !important;
      border-radius: 8px !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    }
    
    .leaflet-popup-tip {
      background-color: ${props => props.$theme.colors.surface} !important;
      border: 1px solid ${props => props.$theme.colors.border} !important;
    }
    
    .leaflet-popup-content {
      margin: 12px !important;
      color: ${props => props.$theme.colors.text} !important;
    }
  }
  
  /* 為所有popup加強字體顯示 */
  .leaflet-popup-content {
    color: ${props => props.$theme.colors.text} !important;
  }
  
  .leaflet-popup-content strong {
    color: ${props => props.$theme.colors.text} !important;
  }
`;

// Taiwan center coordinates
const TAIWAN_CENTER: [number, number] = [23.8, 120.9];
const DEFAULT_ZOOM = 7;

interface TrackPolylineProps {
  track: GpxTrack;
  isHovered: boolean;
  isFocused: boolean;
  theme: Theme;
  onTrackHover: (trackId: string | null) => void;
  onTrackFocus: (trackId: string | null) => void;
}

function TrackPolyline({ 
  track, 
  isHovered, 
  isFocused, 
  theme, 
  onTrackHover, 
  onTrackFocus 
}: TrackPolylineProps) {
  const getTrackColor = () => {
    if (isFocused) return theme.colors.trackFocus;
    if (isHovered) return theme.colors.trackHover;
    return track.color;
  };

  const getTrackWeight = () => {
    if (isFocused) return 8; // 增加focus粗細
    if (isHovered) return 6; // 增加hover粗細
    return 5; // 增加預設粗細
  };

  const getTrackOpacity = () => {
    if (isFocused) return 1;
    if (isHovered) return 0.9;
    return 0.8; // 增加預設透明度
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatElevation = (meters?: number) => {
    if (!meters) return '-';
    return `${Math.round(meters)}m`;
  };

  const formatDistance = (km?: number) => {
    if (!km) return '-';
    return `${km.toFixed(1)}km`;
  };

  const startPoint = track.coordinates[0];
  const endPoint = track.coordinates[track.coordinates.length - 1];

  return (
    <>
      {/* 軌跡線 */}
      <Polyline
        positions={track.coordinates}
        color={getTrackColor()}
        weight={getTrackWeight()}
        opacity={getTrackOpacity()}
        eventHandlers={{
          mouseover: (e) => {
            onTrackHover(track.id);
            // 顯示tooltip
            const popup = L.popup({
              closeButton: false,
              autoClose: false,
              closeOnEscapeKey: false,
              className: 'track-tooltip'
            })
              .setLatLng(e.latlng)
              .setContent(`
                <div style="font-family: sans-serif; min-width: 150px; pointer-events: none;">
                  <strong style="color: ${theme.name === 'dark' ? '#F9FAFB' : '#1F2937'}; font-size: 14px;">${track.name}</strong><br/>
                  <div style="margin-top: 6px; font-size: 12px; color: ${theme.name === 'dark' ? '#9CA3AF' : '#6B7280'};">
                    <div>⏱️ 時間: ${formatTime(track.duration)}</div>
                    <div>📈 爬升: ${formatElevation(track.elevationGain)}</div>
                    <div>📍 距離: ${formatDistance(track.distance)}</div>
                  </div>
                </div>
              `);
            e.target.bindPopup(popup).openPopup();
          },
          mouseout: (e) => {
            // 鼠標離開軌跡時立即關閉hover效果和tooltip
            onTrackHover(null);
            if (e.target.isPopupOpen()) {
              e.target.closePopup();
            }
          },
          click: (e) => {
            try {
              e.originalEvent?.stopPropagation();
              onTrackFocus(isFocused ? null : track.id);
            } catch (error) {
              console.error('Error handling track click:', error);
            }
          }
        }}
      />
      
      {/* 起點標記 - 只在hover或focus時顯示 */}
      {startPoint && (isHovered || isFocused) && (
        <Marker 
          position={startPoint} 
          icon={startIcon}
          eventHandlers={{
            click: (e) => {
              e.originalEvent?.stopPropagation();
              // 點擊起點標記不做任何操作，只顯示popup
            }
          }}
        >
          <Popup>
            <div style={{
              fontFamily: 'sans-serif',
              color: theme.colors.text
            }}>
              <strong style={{ color: theme.colors.text }}>🚀 起點</strong><br/>
              <span style={{ color: theme.colors.textSecondary }}>{track.name}</span>
            </div>
          </Popup>
        </Marker>
      )}
      
      {/* 終點標記 - 只在hover或focus時顯示 */}
      {endPoint && startPoint !== endPoint && (isHovered || isFocused) && (
        <Marker 
          position={endPoint} 
          icon={endIcon}
          eventHandlers={{
            click: (e) => {
              e.originalEvent?.stopPropagation();
              // 點擊終點標記不做任何操作，只顯示popup
            }
          }}
        >
          <Popup>
            <div style={{
              fontFamily: 'sans-serif',
              color: theme.colors.text
            }}>
              <strong style={{ color: theme.colors.text }}>🏁 終點</strong><br/>
              <span style={{ color: theme.colors.textSecondary }}>{track.name}</span>
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
}

interface MapControllerProps {
  tracks: GpxTrack[];
  focusedTrack: string | null;
}

function MapController({ tracks, focusedTrack }: MapControllerProps) {
  const map = useMap();
  const prevFocusedTrack = useRef<string | null>(null);

  useEffect(() => {
    try {
      if (focusedTrack && focusedTrack !== prevFocusedTrack.current) {
        const track = tracks.find(t => t.id === focusedTrack);
        if (track && track.coordinates && track.coordinates.length > 0) {
          // Create bounds from track coordinates
          const bounds = L.latLngBounds(track.coordinates);
          map.fitBounds(bounds, { 
            padding: [20, 20],
            maxZoom: 15
          });
        }
      }
      prevFocusedTrack.current = focusedTrack;
    } catch (error) {
      console.error('Error in MapController:', error);
    }
  }, [focusedTrack, tracks, map]);

  return null;
}

interface MapProps {
  tracks: GpxTrack[];
  hoveredTrack: string | null;
  focusedTrack: string | null;
  theme: Theme;
  onTrackHover: (trackId: string | null) => void;
  onTrackFocus: (trackId: string | null) => void;
}

export function Map({
  tracks,
  hoveredTrack,
  focusedTrack,
  theme,
  onTrackHover,
  onTrackFocus,
}: MapProps) {
  const getTileLayerUrl = () => {
    return theme.name === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  };

  const getTileLayerAttribution = () => {
    return theme.name === 'dark'
      ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  };

  return (
    <MapWrapper $theme={theme}>
      <MapContainer
        center={TAIWAN_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution={getTileLayerAttribution()}
          url={getTileLayerUrl()}
        />
        
        <MapController tracks={tracks} focusedTrack={focusedTrack} />
        
        {tracks.filter(track => track.visible).map(track => (
          <TrackPolyline
            key={track.id}
            track={track}
            isHovered={hoveredTrack === track.id}
            isFocused={focusedTrack === track.id}
            theme={theme}
            onTrackHover={onTrackHover}
            onTrackFocus={onTrackFocus}
          />
        ))}
      </MapContainer>
    </MapWrapper>
  );
}