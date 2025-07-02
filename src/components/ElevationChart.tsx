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
  height: ${props => (props.$collapsed ? `${HEADER_HEIGHT}px` : 'auto')};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  cursor: default;
`;

const PANEL_PADDING = 24;
const HEADER_HEIGHT = 48;
const STATLIST_WIDTH = 140;

const HeaderContainer = styled.div<{ $theme: Theme }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${PANEL_PADDING}px;
  height: ${HEADER_HEIGHT}px;
  border-bottom: 1px solid ${props => props.$theme.colors.border};
  background: ${props => props.$theme.colors.surface};
  border-radius: 12px 12px 0 0;
`;

const BodyContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 100%;
  height: 100%;
  padding: 0 ${PANEL_PADDING}px 0 ${PANEL_PADDING}px;
  box-sizing: border-box;
  margin-top: 20px;
`;

const ChartTitle = styled.div<{ $theme: Theme }>`
  font-size: 16px;
  color: ${props => props.$theme.colors.text};
  font-weight: 600;
`;

const CollapseBtn = styled.button<{ $theme: Theme }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props => props.$theme.colors.surface};
  border: none;
  color: ${props => props.$theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: ${props => props.$theme.colors.border};
    color: ${props => props.$theme.colors.text};
  }
`;

const ChartArea = styled.div`
  flex: 1 1 0%;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  padding: 0;
  min-width: 0;
  cursor: default;
  width: 100%;
  height: 100%;
`;

const StatList = styled.div<{ $theme: Theme }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  color: ${props => props.$theme.colors.textSecondary};
  align-items: flex-start;
  min-width: ${STATLIST_WIDTH}px;
  max-width: ${STATLIST_WIDTH}px;
  padding: 0;
  margin: 0;
  cursor: default;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
);

const DistanceIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
);

const UpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>
);

const DownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>
);

const RangeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 3,18 21,12"/></svg>
);

interface Props {
  track: GpxTrack;
  theme: Theme;
  onHoverIndexChange?: (index: number | null) => void;
}

export function ElevationChart({ track, theme, onHoverIndexChange }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const profile = track.elevationProfile || [];
  const points = profile;
  const minY = points.length > 0 ? Math.min(...points.map((p) => p.elevation)) : 0;
  const maxY = points.length > 0 ? Math.max(...points.map((p) => p.elevation)) : 1;
  const minX = points.length > 0 ? Math.min(...points.map((p) => p.distance)) : 0;
  const maxX = points.length > 0 ? Math.max(...points.map((p) => p.distance)) : 1;
  const chartW = 600, chartH = 120, padX = 54, padY = 18;
  const scaleX = (x: number) => padX + (chartW - 2 * padX) * ((x - minX) / Math.max(maxX - minX, 1e-6));
  const scaleY = (y: number) => chartH - padY - ((y - minY) / Math.max(maxY - minY, 1e-6)) * (chartH - 2 * padY);
  const pathD = points.length > 1
    ? 'M ' + points.map((p) => `${scaleX(p.distance)},${scaleY(p.elevation)}`).join(' L ')
    : '';

  // 處理 hover
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (points.length === 0) return;
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    // 限制 mouseX 在 chart 區域內
    const minPx = scaleX(points[0].distance);
    const maxPx = scaleX(points[points.length - 1].distance);
    const clampedX = Math.max(minPx, Math.min(mouseX, maxPx));
    // 找到最近的點
    let minDist = Infinity;
    let minIdx = 0;
    for (let i = 0; i < points.length; i++) {
      const px = scaleX(points[i].distance);
      const dist = Math.abs(px - clampedX);
      if (dist < minDist) {
        minDist = dist;
        minIdx = i;
      }
    }
    minIdx = Math.max(0, Math.min(minIdx, points.length - 1));
    setHoverIndex(minIdx);
    if (onHoverIndexChange) onHoverIndexChange(minIdx);
  };
  const handleMouseLeave = () => {
    setHoverIndex(null);
    if (onHoverIndexChange) onHoverIndexChange(null);
  };

  function formatTime(minutes?: number) {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  function formatElevation(m?: number) {
    if (!m) return '-';
    return `${Math.round(m)}m`;
  }

  function formatDistance(km?: number) {
    if (!km) return '-';
    return `${km.toFixed(2)}km`;
  }

  return (
    <ChartWrapper $theme={theme} $collapsed={collapsed}>
      <HeaderContainer $theme={theme}>
        <ChartTitle $theme={theme}>詳細資訊</ChartTitle>
        <CollapseBtn $theme={theme} aria-label={collapsed ? '展開' : '收合'} onClick={() => setCollapsed(c => !c)}>
          {collapsed ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </CollapseBtn>
      </HeaderContainer>
      {!collapsed && (
        <BodyContainer>
          <StatList $theme={theme}>
            <StatItem><ClockIcon /> 時間：{formatTime(track.duration)}</StatItem>
            <StatItem><DistanceIcon /> 距離：{formatDistance(track.distance)}</StatItem>
            <StatItem><UpIcon /> 爬升：{formatElevation(track.elevationGain)}</StatItem>
            <StatItem><DownIcon /> 下降：{formatElevation(track.elevationLoss)}</StatItem>
            <StatItem><RangeIcon /> 高度落差：{formatElevation(track.elevationRange)}</StatItem>
          </StatList>
          <ChartArea>
            {points.length > 1 ? (
              <svg
                width={chartW}
                height={chartH}
                style={{ width: '100%', height: '100%', display: 'block' }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <rect x={0} y={0} width={chartW} height={chartH} fill={theme.colors.surface} />
                {/* Y 軸線 */}
                <line x1={padX} y1={padY} x2={padX} y2={chartH - padY} stroke={theme.colors.border} strokeWidth={1} />
                {/* X 軸線 */}
                <line x1={padX} y1={chartH - padY} x2={chartW - padX} y2={chartH - padY} stroke={theme.colors.border} strokeWidth={1} />
                {/* 折線 */}
                <path d={pathD} stroke={theme.colors.primary} strokeWidth={2} fill="none" />
                {/* Hover 垂直線、水平線、圓點、標籤 */}
                {hoverIndex !== null && points[hoverIndex] && (
                  (() => {
                    const px = scaleX(points[hoverIndex].distance);
                    const py = scaleY(points[hoverIndex].elevation);
                    return <>
                      {/* 垂直線 */}
                      <line
                        x1={px}
                        y1={padY}
                        x2={px}
                        y2={chartH - padY}
                        stroke={theme.colors.primary}
                        strokeWidth={1.5}
                        strokeDasharray="4 2"
                        pointerEvents="none"
                      />
                      {/* 水平線 */}
                      <line
                        x1={padX}
                        y1={py}
                        x2={chartW - padX}
                        y2={py}
                        stroke={theme.colors.primary}
                        strokeWidth={1.5}
                        strokeDasharray="4 2"
                        pointerEvents="none"
                      />
                      {/* 圓點 */}
                      <circle
                        cx={px}
                        cy={py}
                        r={5}
                        fill={theme.colors.primary}
                        stroke="#fff"
                        strokeWidth={2}
                        pointerEvents="none"
                      />
                      {/* 距離標籤 */}
                      <rect x={px - 18} y={chartH - padY + 4} width={36} height={18} rx={6} fill={theme.colors.surface} stroke={theme.colors.primary} strokeWidth={0.5} pointerEvents="none" />
                      <text x={px} y={chartH - padY + 17} fontSize="12" fill={theme.colors.primary} textAnchor="middle" pointerEvents="none">{points[hoverIndex].distance.toFixed(2)}km</text>
                      {/* 高度標籤 */}
                      <rect x={padX - 44} y={py - 10} width={38} height={18} rx={6} fill={theme.colors.surface} stroke={theme.colors.primary} strokeWidth={0.5} pointerEvents="none" />
                      <text x={padX - 25} y={py + 4} fontSize="12" fill={theme.colors.primary} textAnchor="middle" pointerEvents="none">{Math.round(points[hoverIndex].elevation)}m</text>
                    </>;
                  })()
                )}
                {/* 標示最大/最小高度 */}
                <text x={padX - 8} y={scaleY(maxY) - 4} fontSize="12" fill={theme.colors.textSecondary} textAnchor="end">{Math.round(maxY)}m</text>
                {/* 最小高度標籤往上偏移避免與 0km 重疊 */}
                <text x={padX - 8} y={scaleY(minY) + 6} fontSize="12" fill={theme.colors.textSecondary} textAnchor="end">{Math.round(minY)}m</text>
                {/* X 軸距離刻度 */}
                <text x={40} y={chartH - padY + 12} fontSize="12" fill={theme.colors.textSecondary} textAnchor="middle">0km</text>
                <text x={chartW - 40} y={chartH - padY + 12} fontSize="12" fill={theme.colors.textSecondary} textAnchor="middle">{maxX.toFixed(2)}km</text>
              </svg>
            ) : (
              <div style={{ color: theme.colors.textSecondary, fontSize: 14, padding: 24 }}>
                無高度資料
              </div>
            )}
          </ChartArea>
        </BodyContainer>
      )}
    </ChartWrapper>
  );
} 