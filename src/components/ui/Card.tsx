import React from 'react';
import styled from 'styled-components';
import { Theme } from '../../types';

type CardVariant = 'default' | 'interactive';

const StyledCard = styled.div<{ 
  $theme: Theme; 
  $variant: CardVariant;
  $isHovered?: boolean;
  $isFocused?: boolean;
  $isActive?: boolean;
}>`
  padding: 16px;
  border-radius: 8px;
  border: 1px solid;
  transition: all 0.2s ease;
  
  /* 景深系統 - 前景區域 */
  background-color: ${props => props.$theme.colors.surface};
  
  /* 配色系統 */
  ${props => {
    const { $theme, $variant, $isHovered, $isFocused, $isActive } = props;
    
    if ($variant === 'interactive') {
      // 互動狀態的邊框和背景
      if ($isFocused) {
        return `
          border-color: ${$theme.colors.primary};
          background-color: ${$theme.colors.primary}08;
          cursor: pointer;
        `;
      } else if ($isHovered) {
        return `
          border-color: ${$theme.colors.secondary};
          background-color: ${$theme.colors.secondary}08;
          cursor: pointer;
        `;
      } else if ($isActive) {
        return `
          border-color: ${$theme.colors.primary};
          background-color: ${$theme.colors.primary}12;
          cursor: pointer;
        `;
      } else {
        return `
          border-color: ${$theme.colors.border};
          cursor: pointer;
          
          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px ${$theme.name === 'dark' 
              ? 'rgba(0, 0, 0, 0.3)' 
              : 'rgba(0, 0, 0, 0.1)'
            };
          }
        `;
      }
    } else {
      // 預設的非互動卡片
      return `
        border-color: ${$theme.colors.border};
      `;
    }
  }}
`;

const CardHeader = styled.div<{ $theme: Theme }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: ${props => props.$theme.colors.text};
  }
`;

const CardContent = styled.div<{ $theme: Theme }>`
  color: ${props => props.$theme.colors.text};
  line-height: 1.5;
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  theme: Theme;
  variant?: CardVariant;
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  isHovered?: boolean;
  isFocused?: boolean;
  isActive?: boolean;
}

export function Card({ 
  theme, 
  variant = 'default', 
  children, 
  title,
  actions,
  isHovered = false,
  isFocused = false,
  isActive = false,
  ...props 
}: CardProps) {
  return (
    <StyledCard 
      $theme={theme} 
      $variant={variant}
      $isHovered={isHovered}
      $isFocused={isFocused}
      $isActive={isActive}
      {...props}
    >
      {(title || actions) && (
        <CardHeader $theme={theme}>
          {title && <h3>{title}</h3>}
          {actions && <CardActions>{actions}</CardActions>}
        </CardHeader>
      )}
      <CardContent $theme={theme}>
        {children}
      </CardContent>
    </StyledCard>
  );
} 