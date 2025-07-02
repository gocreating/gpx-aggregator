import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { ChevronDown } from 'lucide-react';
import { Theme } from '../../types';

// Dropdown states are handled by CSS pseudo-classes

const DropdownContainer = styled.div<{ $theme: Theme }>`
  position: relative;
  width: 100%;
`;

const DropdownButton = styled.button<{ 
  $theme: Theme; 
  $isOpen: boolean;
}>`
  width: 100%;
  padding: 12px 16px;
  background-color: ${props => props.$theme.colors.surface};
  border: 1px solid ${props => props.$theme.colors.border};
  border-radius: 8px;
  color: ${props => props.$theme.colors.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
  font-size: 14px;

  /* 狀態系統 */
  &:hover:not(:disabled) {
    background-color: ${props => 
      props.$isOpen 
        ? props.$theme.colors.surface 
        : props.$theme.colors.background
    };
    border-color: ${props => props.$theme.colors.textSecondary};
  }

  &:focus:not(:disabled) {
    outline: 2px solid ${props => props.$theme.colors.primary}40;
    outline-offset: 2px;
  }

  &:active:not(:disabled) {
    background-color: ${props => props.$theme.colors.border};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: ${props => props.$theme.colors.background};
  }

  /* 開啟狀態 */
  ${props => props.$isOpen && `
    border-color: ${props.$theme.colors.primary};
    background-color: ${props.$theme.colors.surface};
  `}
`;

const DropdownMenu = styled.div<{ $theme: Theme; $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: ${props => props.$theme.colors.surface};
  border: 1px solid ${props => props.$theme.colors.border};
  border-radius: 8px;
  box-shadow: 0 4px 12px ${props => 
    props.$theme.name === 'dark' 
      ? 'rgba(0, 0, 0, 0.3)' 
      : 'rgba(0, 0, 0, 0.15)'
  };
  z-index: 1000;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: translateY(${props => props.$isOpen ? '4px' : '0px'});
  transition: all 0.2s ease;
  overflow: hidden;
`;

const DropdownOption = styled.div<{ 
  $theme: Theme; 
  $isSelected: boolean;
  $isDisabled?: boolean;
}>`
  padding: 12px 16px;
  cursor: ${props => props.$isDisabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
  
  /* 配色系統 */
  background-color: ${props => 
    props.$isSelected 
      ? props.$theme.colors.primary + '12'
      : 'transparent'
  };
  
  color: ${props => {
    if (props.$isDisabled) return props.$theme.colors.textSecondary;
    if (props.$isSelected) return props.$theme.colors.primary;
    return props.$theme.colors.text;
  }};
  
  /* 狀態系統 */
  &:hover:not([data-disabled="true"]) {
    background-color: ${props => 
      props.$isSelected 
        ? props.$theme.colors.primary + '20'
        : props.$theme.colors.border
    };
  }

  &:focus:not([data-disabled="true"]) {
    background-color: ${props => props.$theme.colors.border};
    outline: none;
  }

  &:active:not([data-disabled="true"]) {
    background-color: ${props => props.$theme.colors.border};
  }

  /* 圓角處理 */
  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
  }

  &:only-child {
    border-radius: 8px;
  }

  /* 禁用狀態 */
  opacity: ${props => props.$isDisabled ? 0.5 : 1};
`;

const DropdownContent = styled.div<{ $theme: Theme }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
`;

const DropdownLabel = styled.span<{ $theme: Theme }>`
  font-weight: 500;
  font-size: 14px;
`;

const DropdownDescription = styled.span<{ $theme: Theme }>`
  font-size: 12px;
  color: ${props => props.$theme.colors.textSecondary};
`;

interface DropdownOptionData {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
  content?: React.ReactNode;
}

interface DropdownProps {
  theme: Theme;
  options: DropdownOptionData[];
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  renderSelected?: (option: DropdownOptionData) => React.ReactNode;
  renderOption?: (option: DropdownOptionData) => React.ReactNode;
}

export function Dropdown({
  theme,
  options,
  value,
  placeholder = '請選擇...',
  disabled = false,
  onChange,
  renderSelected,
  renderOption,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

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

  const handleOptionClick = (optionValue: string, optionDisabled?: boolean) => {
    if (optionDisabled) return;
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <DropdownContainer $theme={theme} ref={dropdownRef}>
      <DropdownButton
        $theme={theme}
        $isOpen={isOpen}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div>
          {selectedOption ? (
            renderSelected ? renderSelected(selectedOption) : (
              <DropdownContent $theme={theme}>
                <DropdownLabel $theme={theme}>{selectedOption.label}</DropdownLabel>
                {selectedOption.description && (
                  <DropdownDescription $theme={theme}>
                    {selectedOption.description}
                  </DropdownDescription>
                )}
              </DropdownContent>
            )
          ) : (
            <span style={{ color: theme.colors.textSecondary }}>{placeholder}</span>
          )}
        </div>
        <ChevronDown 
          size={16} 
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }} 
        />
      </DropdownButton>
      
      <DropdownMenu $theme={theme} $isOpen={isOpen}>
        {options.map((option) => (
          <DropdownOption
            key={option.value}
            $theme={theme}
            $isSelected={option.value === value}
            $isDisabled={option.disabled}
            data-disabled={option.disabled}
            onClick={() => handleOptionClick(option.value, option.disabled)}
          >
            {renderOption ? renderOption(option) : (
              <DropdownContent $theme={theme}>
                <DropdownLabel $theme={theme}>{option.label}</DropdownLabel>
                {option.description && (
                  <DropdownDescription $theme={theme}>
                    {option.description}
                  </DropdownDescription>
                )}
              </DropdownContent>
            )}
            {option.content}
          </DropdownOption>
        ))}
      </DropdownMenu>
    </DropdownContainer>
  );
} 