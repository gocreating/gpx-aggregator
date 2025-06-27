import React, { useRef } from 'react';
import styled from 'styled-components';
import { FolderOpen, Clock, TrendingUp, MapPin, Trash2, Palette, Eye, EyeOff } from 'lucide-react';
import { GpxTrack, Theme } from '../types';
import { parseGpxFiles } from '../utils/gpxParser';
import { themes } from '../themes';

const SidebarContainer = styled.div<{ $theme: Theme }>`
  width: 320px;
  height: 100vh;
  background-color: ${props => props.$theme.colors.surface};
  border-right: 1px solid ${props => props.$theme.colors.border};
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Header = styled.div<{ $theme: Theme }>`
  h1 {
    color: ${props => props.$theme.colors.text};
    font-size: 24px;
    font-weight: bold;
    margin: 0 0 10px 0;
  }
  
  p {
    color: ${props => props.$theme.colors.textSecondary};
    font-size: 14px;
    margin: 0;
  }
`;

const ActionButton = styled.button<{ $theme: Theme; $variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 1px solid ${props => props.$variant === 'primary' ? props.$theme.colors.primary : props.$theme.colors.border};
  background-color: ${props => props.$variant === 'primary' ? props.$theme.colors.primary : 'transparent'};
  color: ${props => props.$variant === 'primary' ? '#FFFFFF' : props.$theme.colors.text};
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.$variant === 'primary' ? '#2563EB' : props.$theme.colors.surface};
    transform: translateY(-1px);
  }
`;

const ThemeSelector = styled.select<{ $theme: Theme }>`
  padding: 8px 12px;
  border: 1px solid ${props => props.$theme.colors.border};
  background-color: ${props => props.$theme.colors.background};
  color: ${props => props.$theme.colors.text};
  border-radius: 6px;
  font-size: 14px;
`;

const TrackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TrackItem = styled.div<{ 
  $theme: Theme; 
  $isHovered: boolean; 
  $isFocused: boolean;
  $trackColor: string;
}>`
  padding: 16px;
  border: 2px solid ${props => 
    props.$isFocused ? props.$theme.colors.trackFocus :
    props.$isHovered ? props.$theme.colors.trackHover :
    props.$theme.colors.border
  };
  background-color: ${props => props.$theme.colors.background};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: ${props => props.$trackColor};
    border-radius: 2px 0 0 2px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const TrackHeader = styled.div<{ $theme: Theme }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  h3 {
    color: ${props => props.$theme.colors.text};
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    flex: 1;
  }
  
  .button-group {
    display: flex;
    gap: 4px;
    align-items: center;
  }
`;

const TrackActionButton = styled.button<{ $theme: Theme; $type?: 'delete' | 'visibility' }>`
  background: none;
  border: none;
  color: ${props => props.$theme.colors.textSecondary};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.$theme.colors.border};
    color: ${props => {
      if (props.$type === 'delete') return '#EF4444';
      if (props.$type === 'visibility') return props.$theme.colors.primary;
      return props.$theme.colors.text;
    }};
  }
`;

const TrackStats = styled.div<{ $theme: Theme }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  .stat {
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${props => props.$theme.colors.textSecondary};
    font-size: 14px;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

interface SidebarProps {
  tracks: GpxTrack[];
  hoveredTrack: string | null;
  focusedTrack: string | null;
  theme: Theme;
  onTracksAdd: (tracks: GpxTrack[]) => void;
  onTrackHover: (trackId: string | null) => void;
  onTrackFocus: (trackId: string | null) => void;
  onTrackRemove: (trackId: string) => void;
  onTrackVisibilityToggle: (trackId: string) => void;
  onThemeChange: (theme: Theme) => void;
}

export function Sidebar({
  tracks,
  hoveredTrack,
  focusedTrack,
  theme,
  onTracksAdd,
  onTrackHover,
  onTrackFocus,
  onTrackRemove,
  onTrackVisibilityToggle,
  onThemeChange,
}: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFolderSelect = async () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      try {
        const newTracks = await parseGpxFiles(files);
        onTracksAdd(newTracks);
      } catch (error) {
        console.error('Error parsing GPX files:', error);
        alert('解析GPX檔案時發生錯誤');
      }
    }
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

  return (
    <SidebarContainer $theme={theme}>
      <Header $theme={theme}>
        <h1>GPX Map Viewer</h1>
        <p>選擇資料夾來載入GPX軌跡檔案</p>
      </Header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <ActionButton 
          $theme={theme} 
          $variant="primary" 
          onClick={handleFolderSelect}
        >
          <FolderOpen size={18} />
          選擇資料夾
        </ActionButton>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Palette size={16} color={theme.colors.textSecondary} />
          <ThemeSelector
            $theme={theme}
            value={theme.name}
            onChange={(e) => {
              const selectedTheme = themes.find(t => t.name === e.target.value);
              if (selectedTheme) onThemeChange(selectedTheme);
            }}
          >
            {themes.map(t => (
              <option key={t.name} value={t.name}>
                {t.name === 'light' ? '淺色主題' : '深色主題'}
              </option>
            ))}
          </ThemeSelector>
        </div>
      </div>

      <HiddenInput
        ref={fileInputRef}
        type="file"
        multiple
        accept=".gpx"
        // @ts-expect-error webkitdirectory is not in the type definitions
        webkitdirectory=""
        onChange={handleFileChange}
      />

      <TrackList>
        {tracks.map(track => (
          <TrackItem
            key={track.id}
            $theme={theme}
            $isHovered={hoveredTrack === track.id}
            $isFocused={focusedTrack === track.id}
            $trackColor={track.color}
            onMouseEnter={() => onTrackHover(track.id)}
            onMouseLeave={() => onTrackHover(null)}
            onClick={() => onTrackFocus(track.id === focusedTrack ? null : track.id)}
          >
            <TrackHeader $theme={theme}>
              <h3>{track.name}</h3>
              <div className="button-group">
                <TrackActionButton 
                  $theme={theme}
                  $type="visibility"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTrackVisibilityToggle(track.id);
                  }}
                  title={track.visible ? '隱藏軌跡' : '顯示軌跡'}
                >
                  {track.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </TrackActionButton>
                <TrackActionButton 
                  $theme={theme}
                  $type="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTrackRemove(track.id);
                  }}
                  title="刪除軌跡"
                >
                  <Trash2 size={16} />
                </TrackActionButton>
              </div>
            </TrackHeader>
            
            <TrackStats $theme={theme}>
              <div className="stat">
                <Clock size={16} />
                <span>時間: {formatTime(track.duration)}</span>
              </div>
              <div className="stat">
                <TrendingUp size={16} />
                <span>爬升: {formatElevation(track.elevationGain)}</span>
              </div>
              <div className="stat">
                <MapPin size={16} />
                <span>距離: {formatDistance(track.distance)}</span>
              </div>
            </TrackStats>
          </TrackItem>
        ))}
      </TrackList>

      {tracks.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          color: theme.colors.textSecondary,
          fontSize: '14px',
          padding: '40px 20px'
        }}>
          尚未載入任何軌跡檔案
        </div>
      )}
    </SidebarContainer>
  );
}