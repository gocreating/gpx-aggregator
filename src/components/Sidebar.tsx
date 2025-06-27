import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { FolderOpen, Clock, TrendingUp, MapPin, Trash2, Palette, Eye, EyeOff, Folder, ChevronDown } from 'lucide-react';
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
    background-color: ${props => 
      props.$variant === 'primary' 
        ? props.$theme.colors.secondary 
        : props.$theme.colors.surface
    };
    border-color: ${props => 
      props.$variant === 'primary' 
        ? props.$theme.colors.secondary 
        : props.$theme.colors.border
    };
    transform: translateY(-1px);
  }
`;

const ThemeSelector = styled.div<{ $theme: Theme }>`
  position: relative;
  margin-bottom: 20px;
`;

const ThemeButton = styled.button<{ $theme: Theme; $isOpen: boolean }>`
  width: 100%;
  padding: 12px 16px;
  background: ${props => props.$theme.colors.surface};
  border: 1px solid ${props => props.$theme.colors.border};
  border-radius: 8px;
  color: ${props => props.$theme.colors.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$isOpen ? props.$theme.colors.surface : props.$theme.colors.border};
  }
`;

const ThemeDropdown = styled.div<{ $theme: Theme; $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${props => props.$theme.colors.surface};
  border: 1px solid ${props => props.$theme.colors.border};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: translateY(${props => props.$isOpen ? '4px' : '0px'});
  transition: all 0.2s ease;
`;

const ThemeOption = styled.div<{ $theme: Theme; $isSelected: boolean }>`
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${props => props.$isSelected ? props.$theme.colors.border : 'transparent'};
  
  &:hover {
    background: ${props => props.$theme.colors.border};
  }

  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
  }
`;

const ThemeInfo = styled.div<{ $theme: Theme }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const ThemeName = styled.span<{ $theme: Theme }>`
  color: ${props => props.$theme.colors.text};
  font-weight: 500;
  margin-bottom: 4px;
`;

const ColorPreview = styled.div`
  display: flex;
  gap: 4px;
`;

const ColorDot = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$color};
  border: 1px solid rgba(255, 255, 255, 0.2);
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
}>`
  padding: 16px;
  border: 1px solid ${props => 
    props.$isFocused ? props.$theme.colors.primary :
    props.$isHovered ? props.$theme.colors.secondary :
    props.$theme.colors.border
  };
  background-color: ${props => 
    props.$isFocused ? `${props.$theme.colors.primary}08` :
    props.$isHovered ? `${props.$theme.colors.secondary}08` :
    props.$theme.colors.surface
  };
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px ${props => 
      props.$theme.name === 'dark' 
        ? 'rgba(0, 0, 0, 0.3)' 
        : 'rgba(0, 0, 0, 0.1)'
    };
  }
`;

const TrackHeader = styled.div<{ 
  $theme: Theme; 
  $isHovered: boolean; 
  $isFocused: boolean; 
}>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  h3 {
    color: ${props => 
      props.$isFocused ? props.$theme.colors.primary :
      props.$isHovered ? props.$theme.colors.secondary :
      props.$theme.colors.text
    };
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    flex: 1;
    transition: color 0.2s ease;
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

function ThemeSwitcher({ currentTheme, onThemeChange }: { currentTheme: Theme; onThemeChange: (theme: Theme) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <ThemeSelector $theme={currentTheme} ref={dropdownRef}>
      <ThemeButton
        $theme={currentTheme}
        $isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <ThemeInfo $theme={currentTheme}>
          <ThemeName $theme={currentTheme}>
            {currentTheme.name === 'dark' ? '深色主題' : '淺色主題'}
          </ThemeName>
          <ColorPreview>
            <ColorDot $color={currentTheme.colors.tertiary} />
            <ColorDot $color={currentTheme.colors.secondary} />
            <ColorDot $color={currentTheme.colors.primary} />
          </ColorPreview>
        </ThemeInfo>
        <ChevronDown 
          size={16} 
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }} 
        />
      </ThemeButton>
      
      <ThemeDropdown $theme={currentTheme} $isOpen={isOpen}>
        {themes.map((theme) => (
          <ThemeOption
            key={theme.name}
            $theme={currentTheme}
            $isSelected={theme.name === currentTheme.name}
            onClick={() => {
              onThemeChange(theme);
              setIsOpen(false);
            }}
          >
            <ThemeInfo $theme={currentTheme}>
              <ThemeName $theme={currentTheme}>
                {theme.name === 'dark' ? '深色主題' : '淺色主題'}
              </ThemeName>
              <ColorPreview>
                <ColorDot $color={theme.colors.tertiary} title="預設顏色 (tertiary)" />
                <ColorDot $color={theme.colors.secondary} title="Hover顏色 (secondary)" />
                <ColorDot $color={theme.colors.primary} title="Focus顏色 (primary)" />
              </ColorPreview>
            </ThemeInfo>
          </ThemeOption>
        ))}
      </ThemeDropdown>
    </ThemeSelector>
  );
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
        <ThemeSwitcher 
          currentTheme={theme}
          onThemeChange={onThemeChange}
        />

        <ActionButton 
          $theme={theme} 
          $variant="primary" 
          onClick={handleFolderSelect}
        >
          <Folder size={18} />
          選擇資料夾
        </ActionButton>
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

            onMouseEnter={() => onTrackHover(track.id)}
            onMouseLeave={() => onTrackHover(null)}
            onClick={() => onTrackFocus(track.id === focusedTrack ? null : track.id)}
          >
            <TrackHeader 
              $theme={theme}
              $isHovered={hoveredTrack === track.id}
              $isFocused={focusedTrack === track.id}
            >
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