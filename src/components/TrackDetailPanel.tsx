import React, { useState } from 'react';
import styled from 'styled-components';
import { GpxTrack, Theme } from '../types';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const Panel = styled.div<{ $theme: Theme; $collapsed: boolean }>`
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 1200;
  width: ${props => (props.$collapsed ? '48px' : '320px')};
  min-height: 48px;
  background: ${props => props.$theme.colors.surface};
  border: 1px solid ${props => props.$theme.colors.border};
  border-radius: 14px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  transition: width 0.28s cubic-bezier(.4,2,.6,1), background 0.2s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const Content = styled.div<{ $collapsed: boolean }>`
  opacity: ${props => (props.$collapsed ? 0 : 1)};
  transform: translateX(${props => (props.$collapsed ? '24px' : '0')});
  pointer-events: ${props => (props.$collapsed ? 'none' : 'auto')};
  transition: opacity 0.22s cubic-bezier(.4,2,.6,1), transform 0.22s cubic-bezier(.4,2,.6,1);
  width: 100%;
`;

const Header = styled.div<{ $theme: Theme }>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 10px 16px 4px 16px;
  background: none;
`;

const Title = styled.h2<{ $theme: Theme }>`
  font-size: 15px;
  color: ${props => props.$theme.colors.text};
  margin: 0;
  font-weight: 700;
`;

const StatList = styled.div<{ $theme: Theme }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 16px 12px 16px;
`;

const StatRow = styled.div<{ $theme: Theme }>`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.$theme.colors.textSecondary};
  font-size: 13px;
`;

const ExpandBtn = styled.button<{ $theme: Theme }>`
  width: 40px;
  height: 40px;
  margin: 8px;
  border-radius: 50%;
  background: ${props => props.$theme.colors.surface};
  border: 1px solid ${props => props.$theme.colors.border};
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

const CollapseBtn = styled(ExpandBtn)`
  margin: 8px 8px 0 auto;
`;

// Tooltip-style icon SVG
const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
);

interface Props {
  track: GpxTrack;
  theme: Theme;
}

export function TrackDetailPanel({ track, theme }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  if (!track) return null;

  return (
    <Panel $theme={theme} $collapsed={collapsed}>
      {collapsed ? (
        <ExpandBtn $theme={theme} aria-label="展開" onClick={() => setCollapsed(false)}>
          <ChevronLeft size={20} />
        </ExpandBtn>
      ) : (
        <>
          <CollapseBtn $theme={theme} aria-label="收合" onClick={() => setCollapsed(true)}>
            <InfoIcon />
          </CollapseBtn>
          <Content $collapsed={collapsed}>
            <Header $theme={theme}>
              <Title $theme={theme}>{track.name}</Title>
            </Header>
            <StatList $theme={theme}>
              <StatRow $theme={theme}><InfoIcon /> 時間：{formatTime(track.duration)}</StatRow>
              <StatRow $theme={theme}><InfoIcon /> 距離：{formatDistance(track.distance)}</StatRow>
              <StatRow $theme={theme}><InfoIcon /> 爬升：{formatElevation(track.elevationGain)}</StatRow>
              <StatRow $theme={theme}><InfoIcon /> 下降：{formatElevation(track.elevationLoss)}</StatRow>
              <StatRow $theme={theme}><InfoIcon /> 高度落差：{formatElevation(track.elevationRange)}</StatRow>
            </StatList>
          </Content>
        </>
      )}
    </Panel>
  );
}

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