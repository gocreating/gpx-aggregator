import React from 'react';
import styled from 'styled-components';
import { Theme } from '../../types';

type ButtonVariant = 'primary' | 'secondary' | 'default';

const StyledButton = styled.button<{ 
  $theme: Theme; 
  $variant: ButtonVariant;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
  
  /* 配色系統 */
  ${props => {
    const { $theme, $variant } = props;
    
    switch ($variant) {
      case 'primary':
        return `
          background-color: ${$theme.colors.primary};
          border-color: ${$theme.colors.primary};
          color: ${$theme.name === 'dark' ? '#FFFFFF' : '#FFFFFF'};
          
          &:hover:not(:disabled) {
            background-color: ${$theme.colors.secondary};
            border-color: ${$theme.colors.secondary};
            transform: translateY(-1px);
          }
          
          &:focus:not(:disabled) {
            outline: 2px solid ${$theme.colors.primary}40;
            outline-offset: 2px;
          }
          
          &:active:not(:disabled) {
            transform: translateY(0px);
            background-color: ${$theme.colors.primary};
            opacity: 0.9;
          }
        `;
      
      case 'secondary':
        return `
          background-color: transparent;
          border-color: ${$theme.colors.secondary};
          color: ${$theme.colors.secondary};
          
          &:hover:not(:disabled) {
            background-color: ${$theme.colors.secondary}10;
            transform: translateY(-1px);
          }
          
          &:focus:not(:disabled) {
            outline: 2px solid ${$theme.colors.secondary}40;
            outline-offset: 2px;
          }
          
          &:active:not(:disabled) {
            transform: translateY(0px);
            background-color: ${$theme.colors.secondary}20;
          }
        `;
      
      default: // 'default'
        return `
          background-color: ${$theme.colors.surface};
          border-color: ${$theme.colors.border};
          color: ${$theme.colors.text};
          
          &:hover:not(:disabled) {
            background-color: ${$theme.colors.background};
            border-color: ${$theme.colors.textSecondary};
            transform: translateY(-1px);
          }
          
          &:focus:not(:disabled) {
            outline: 2px solid ${$theme.colors.primary}40;
            outline-offset: 2px;
          }
          
          &:active:not(:disabled) {
            transform: translateY(0px);
            background-color: ${$theme.colors.border};
          }
        `;
    }
  }}
  
  /* 禁用狀態 */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  theme: Theme;
  variant?: ButtonVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function Button({ 
  theme, 
  variant = 'default', 
  children, 
  icon,
  ...props 
}: ButtonProps) {
  return (
    <StyledButton 
      $theme={theme} 
      $variant={variant}
      {...props}
    >
      {icon}
      {children}
    </StyledButton>
  );
} 