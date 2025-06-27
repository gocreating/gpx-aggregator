import React, { useEffect, useRef, useState } from 'react';
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

// 創建動態的起點和終點圖標
function createStartIcon(theme: Theme): L.DivIcon {
  // 使用 tertiary 顏色創建 SVG 圓形標記
  const color = theme.colors.tertiary;
  const svgIcon = `
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="10" cy="10" r="4" fill="white"/>
    </svg>
  `;
  
  return new L.DivIcon({
    html: svgIcon,
    className: 'start-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
}

function createEndIcon(theme: Theme): L.DivIcon {
  // 使用 primary 顏色創建 SVG 方形標記
  const color = theme.colors.primary;
  const svgIcon = `
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="16" height="16" fill="${color}" stroke="white" stroke-width="2" rx="2"/>
      <rect x="6" y="6" width="8" height="8" fill="white" rx="1"/>
    </svg>
  `;
  
  return new L.DivIcon({
    html: svgIcon,
    className: 'end-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
}

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
  .start-marker,
  .end-marker {
    border: none !important;
    background: transparent !important;
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
  const map = useMap();
  const [hoverWeight, setHoverWeight] = useState(15);
  const [showMarkers, setShowMarkers] = useState(false);

  useEffect(() => {
    const updateSettings = () => {
      const zoom = map.getZoom();
      
      // 根據縮放等級動態調整 hover 偵測範圍
      // 縮放等級越低（地圖越小），hover 範圍越大
      // 縮放等級越高（地圖越大），hover 範圍相對較小但仍然友好
      let weight;
      if (zoom <= 8) {
        weight = 25; // 很寬的偵測範圍，適合查看整個台灣
      } else if (zoom <= 10) {
        weight = 20; // 寬偵測範圍，適合查看地區
      } else if (zoom <= 12) {
        weight = 15; // 中等偵測範圍，適合查看城市
      } else if (zoom <= 14) {
        weight = 12; // 較窄偵測範圍，適合查看街道
      } else {
        weight = 10; // 最窄偵測範圍，適合詳細查看
      }
      setHoverWeight(weight);
      
      // 只有在縮放等級足夠大時才顯示起點終點標記
      // 避免在小縮放等級時造成 hover 抖動問題
      setShowMarkers(zoom >= 11);
    };

    // 初始設定
    updateSettings();

    // 監聽縮放變化
    map.on('zoomend', updateSettings);

    // 清理事件監聽器
    return () => {
      map.off('zoomend', updateSettings);
    };
  }, [map]);
  const getTrackColor = () => {
    if (isFocused) return theme.colors.trackFocus;
    if (isHovered) return theme.colors.trackHover;
    return theme.colors.trackDefault;
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
      {/* 隱形的寬軌跡線用於增加hover偵測範圍 */}
      <Polyline
        key={`${track.id}-hover-area`}
        positions={track.coordinates}
        color="transparent"
        weight={hoverWeight}
        opacity={0}
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
                    <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                      </svg>
                      時間: ${formatTime(track.duration)}
                    </div>
                    <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                      </svg>
                      爬升: ${formatElevation(track.elevationGain)}
                    </div>
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      距離: ${formatDistance(track.distance)}
                    </div>
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
      
      {/* 可見的軌跡線 */}
      <Polyline
        key={`${track.id}-${isHovered}-${isFocused}`}
        positions={track.coordinates}
        color={getTrackColor()}
        weight={getTrackWeight()}
        opacity={getTrackOpacity()}
      />
      
      {/* 起點標記 - 只在hover或focus且縮放足夠大時顯示 */}
      {startPoint && (isHovered || isFocused) && showMarkers && (
        <Marker 
          position={startPoint} 
          icon={createStartIcon(theme)}
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
      
      {/* 終點標記 - 只在hover或focus且縮放足夠大時顯示 */}
      {endPoint && startPoint !== endPoint && (isHovered || isFocused) && showMarkers && (
        <Marker 
          position={endPoint} 
          icon={createEndIcon(theme)}
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