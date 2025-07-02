import React, { useRef } from 'react';
import styled from 'styled-components';
import { Clock, TrendingUp, MapPin, Trash2, Eye, EyeOff, Folder } from 'lucide-react';
import { GpxTrack, Theme } from '../types';
import { parseGpxFiles } from '../utils/gpxParser';
import { themes } from '../themes';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Dropdown } from './ui/Dropdown';

const ToolbarContainer = styled.div<{ $theme: Theme }>`
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

const HiddenInput = styled.input`
  display: none;
`;

const TrackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TrackActionButton = styled.button<{ 
  $theme: Theme; 
  $type: 'visibility' | 'delete';
}>`
  padding: 8px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  color: ${props => props.$theme.colors.textSecondary};
  
  &:hover {
    background-color: ${props => 
      props.$type === 'delete' 
        ? '#dc262620' 
        : props.$theme.colors.border
    };
    color: ${props => 
      props.$type === 'delete' 
        ? '#dc2626' 
        : props.$theme.colors.text
    };
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
    font-size: 13px;
    
    svg {
      color: ${props => props.$theme.colors.tertiary};
    }
  }
`;

interface ToolbarProps {
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

export function Toolbar({
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
}: ToolbarProps) {
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

  // 轉換主題資料為 Dropdown 選項
  const themeOptions = themes.map(t => ({
    label: t.name === 'dark' ? '深色主題' : '淺色主題',
    value: t.name,
    description: t.name === 'dark' ? '適合低光環境' : '適合明亮環境',
    content: (
      <div style={{ display: 'flex', gap: '4px' }}>
        <div 
          style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            background: t.colors.tertiary,
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }} 
          title="預設顏色"
        />
        <div 
          style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            background: t.colors.secondary,
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }} 
          title="Hover顏色"
        />
        <div 
          style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            background: t.colors.primary,
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }} 
          title="Focus顏色"
        />
      </div>
    )
  }));

  return (
    <ToolbarContainer $theme={theme}>
      <Header $theme={theme}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '8px' 
        }}>
          <img 
            src="/logo.svg" 
            alt="軌跡存摺" 
            width="32" 
            height="32" 
            style={{ flexShrink: 0 }}
          />
          <h1 style={{ margin: 0, lineHeight: '32px' }}>軌跡存摺</h1>
        </div>
        <p>選擇資料夾來載入GPX軌跡檔案</p>
      </Header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Dropdown
          theme={theme}
          options={themeOptions}
          value={theme.name}
          onChange={(themeName) => {
            const selectedTheme = themes.find(t => t.name === themeName);
            if (selectedTheme) {
              onThemeChange(selectedTheme);
            }
          }}
        />

        <Button 
          theme={theme}
          variant="primary" 
          icon={<Folder size={18} />}
          onClick={handleFolderSelect}
        >
          選擇資料夾
        </Button>
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
          <Card
            key={track.id}
            theme={theme}
            variant="interactive"
            isHovered={hoveredTrack === track.id}
            isFocused={focusedTrack === track.id}
            title={track.name}
            actions={
              <>
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
              </>
            }
            onMouseEnter={() => onTrackHover(track.id)}
            onMouseLeave={() => onTrackHover(null)}
            onClick={() => onTrackFocus(track.id === focusedTrack ? null : track.id)}
          >
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
          </Card>
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
    </ToolbarContainer>
  );
} 