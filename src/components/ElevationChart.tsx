import React, { useState } from 'react';
import styled from 'styled-components';
import { GpxTrack, Theme } from '../types';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ChartWrapper = styled.div<{ $theme: Theme; $collapsed: boolean }>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1200;
  background: ${props => props.$theme.colors.surface};
  border-top: 1px solid ${props => props.$theme.colors.border};
  box-shadow: 0 -2px 16px rgba(0,0,0,0.10);
  border-radius: 12px 12px 0 0;
  transition: height 0.3s cubic-bezier(.4,2,.6,1), background 0.2s;
  height: ${props => (props.$collapsed ? '48px' : '220px')};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const ChartHeader = styled.div<{ $theme: Theme }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px 0 20px;
`;

const ChartTitle = styled.div<{ $theme: Theme }>`
  font-size: 16px;
  color: ${props => props.$theme.colors.text};
  font-weight: 600;
`;

const CollapseBtn = styled.button<{ $theme: Theme }>`
  background: none;
  border: none;
  color: ${props => props.$theme.colors.textSecondary};
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: background 0.2s;
  &:hover {
    background: ${props => props.$theme.colors.border};
  }
`;

const ChartArea = styled.div`
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 20px 16px 20px;
`;

interface Props {
  track: GpxTrack;
  theme: Theme;
}

export function ElevationChart({ track, theme }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const profile = track.elevationProfile || [];
  const points = profile;
  const minY = points.length > 0 ? Math.min(...points.map((p) => p.elevation)) : 0;
  const maxY = points.length > 0 ? Math.max(...points.map((p) => p.elevation)) : 1;
  const minX = points.length > 0 ? Math.min(...points.map((p) => p.distance)) : 0;
  const maxX = points.length > 0 ? Math.max(...points.map((p) => p.distance)) : 1;
  const chartW = 600, chartH = 120, padX = 36, padY = 18;
  const scaleX = (x: number) => padX + (chartW - 2 * padX) * ((x - minX) / Math.max(maxX - minX, 1e-6));
  const scaleY = (y: number) => chartH - padY - ((y - minY) / Math.max(maxY - minY, 1e-6)) * (chartH - 2 * padY);
  const pathD = points.length > 1
    ? 'M ' + points.map((p) => `${scaleX(p.distance)},${scaleY(p.elevation)}`).join(' L ')
    : '';

  return (
    <ChartWrapper $theme={theme} $collapsed={collapsed}>
      <ChartHeader $theme={theme}>
        <ChartTitle $theme={theme}>高度變化圖</ChartTitle>
        <CollapseBtn $theme={theme} aria-label={collapsed ? '展開' : '收合'} onClick={() => setCollapsed(c => !c)}>
          {collapsed ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </CollapseBtn>
      </ChartHeader>
      {!collapsed && (
        <ChartArea>
          {points.length > 1 ? (
            <svg width={chartW} height={chartH} style={{ width: '100%', maxWidth: 600 }}>
              <rect x={0} y={0} width={chartW} height={chartH} fill={theme.colors.surface} />
              {/* Y 軸線 */}
              <line x1={padX} y1={padY} x2={padX} y2={chartH - padY} stroke={theme.colors.border} strokeWidth={1} />
              {/* X 軸線 */}
              <line x1={padX} y1={chartH - padY} x2={chartW - padX} y2={chartH - padY} stroke={theme.colors.border} strokeWidth={1} />
              {/* 折線 */}
              <path d={pathD} stroke={theme.colors.primary} strokeWidth={2} fill="none" />
              {/* 標示最大/最小高度 */}
              <text x={padX + 4} y={scaleY(maxY) - 4} fontSize="12" fill={theme.colors.textSecondary}>{Math.round(maxY)}m</text>
              <text x={padX + 4} y={scaleY(minY) + 16} fontSize="12" fill={theme.colors.textSecondary}>{Math.round(minY)}m</text>
              {/* X 軸距離刻度 */}
              <text x={padX} y={chartH - padY + 16} fontSize="12" fill={theme.colors.textSecondary}>0km</text>
              <text x={chartW - padX - 24} y={chartH - padY + 16} fontSize="12" fill={theme.colors.textSecondary}>{maxX.toFixed(2)}km</text>
            </svg>
          ) : (
            <div style={{ color: theme.colors.textSecondary, fontSize: 14, padding: 24 }}>
              無高度資料
            </div>
          )}
        </ChartArea>
      )}
    </ChartWrapper>
  );
} 