import React, { useRef } from 'react';
import styled from 'styled-components';

// Define the props for the SegmentedController component
interface SegmentedControllerProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  orientation?: 'horizontal' | 'vertical'; // Add orientation property
  disabled?: boolean;
  id?: string;
  className?: string;
}

// Styled components for the SegmentedController
const ControllerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Label = styled.label`
  font-weight: 400;
  margin-bottom: 0.3rem;
  font-size: 22px;
`;

// Make the SegmentedControl support vertical or horizontal orientation
interface SegmentedControlProps {
  orientation: 'horizontal' | 'vertical';
}

const SegmentedControl = styled.div<SegmentedControlProps>`
  display: flex;
  flex-direction: ${props => props.orientation === 'vertical' ? 'column' : 'row'};
  border-radius: 6px;
  overflow: hidden;
  width: fit-content;
  min-width: 150px;
  position: relative;
`;

interface SegmentProps {
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  disabled?: boolean;
  orientation: 'horizontal' | 'vertical';
  isFocused?: boolean;
  isNextActive?: boolean;
  isPrevActive?: boolean;
}

// Remove these constant color definitions since we'll use theme values
// const BORDER_GRAY = 'rgb(144, 144, 144)';
// const BORDER_BLUE = 'rgb(36, 120, 204)';
// const BG_BLUE = 'rgb(36, 120, 204)';

const Segment = styled.button<SegmentProps>`
  flex: ${props => props.orientation === 'horizontal' ? '1' : 'initial'};
  padding: 0.5rem;
  background-color: ${props => props.isActive 
    ? props.theme.colors.primaryBlue.button 
    : props.theme.colors.background.main};
  color: ${props => props.isActive 
    ? props.theme.colors.text.onPrimary 
    : props.theme.colors.primaryBlue.text};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
  opacity: ${props => props.disabled ? '0.6' : '1'};
  text-align: ${props => props.orientation === 'vertical' ? 'left' : 'center'};
  position: relative;
  z-index: ${props => props.isActive ? 2 : 1};
  
  /* Border styles */
  border: 2px solid ${props => props.isActive 
    ? props.theme.colors.primaryBlue.border 
    : props.theme.colors.border.main};
  
  /* Handle border radius for first and last segments */
  border-top-left-radius: ${props => 
    (props.orientation === 'horizontal' && props.isFirst) || 
    (props.orientation === 'vertical' && props.isFirst) ? props.theme.borderRadius : '0'};
  border-top-right-radius: ${props => 
    (props.orientation === 'horizontal' && props.isLast) || 
    (props.orientation === 'vertical' && props.isFirst) ? props.theme.borderRadius : '0'};
  border-bottom-left-radius: ${props => 
    (props.orientation === 'horizontal' && props.isFirst) || 
    (props.orientation === 'vertical' && props.isLast) ? props.theme.borderRadius : '0'};
  border-bottom-right-radius: ${props => 
    (props.orientation === 'horizontal' && props.isLast) || 
    (props.orientation === 'vertical' && props.isLast) ? props.theme.borderRadius : '0'};

  /* Collapse borders */
  ${props => props.orientation === 'horizontal' && !props.isFirst ? `margin-left: -2px;` : ''}
  ${props => props.orientation === 'vertical' && !props.isFirst ? `margin-top: -2px;` : ''}
  
  /* Focus style when using keyboard navigation */
  ${props => props.isFocused && `
    outline: 2px solid ${props.theme.colors.border.focus};
    outline-offset: -2px;
    z-index: 3;
  `}
  
  /* Ensure active segments are on top to show their borders */
  ${props => props.isActive && `
    z-index: 2;
  `}
  
  &:hover {
    background-color: ${props => props.isActive 
      ? props.theme.colors.primaryBlue.hover 
      : props.disabled 
        ? props.theme.colors.background.main 
        : props.theme.colors.background.hover};
  }
`;

// Hidden input to handle native keyboard navigation
const HiddenRadio = styled.input`
  position: absolute;
  opacity: 0;
  pointer-events: none;
`;

/**
 * SegmentedController component for selecting from a set of options
 * Supports both horizontal and vertical orientations
 */
const SegmentedController: React.FC<SegmentedControllerProps> = ({
  label,
  options,
  value,
  onChange,
  orientation = 'horizontal', // Default to horizontal
  disabled,
  id,
  className,
}) => {
  // Generate a unique ID if none is provided
  const uniqueId = id || `segmented-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  // Create refs for all the radio inputs
  const radioRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Track which option is currently focused
  const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null);
  
  // Handle focus and blur events
  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };
  
  const handleBlur = () => {
    setFocusedIndex(null);
  };
  
  return (
    <ControllerContainer className={className}>
      <Label id={`${uniqueId}-label`}>{label}</Label>
      <SegmentedControl 
        role="radiogroup" 
        aria-labelledby={`${uniqueId}-label`}
        orientation={orientation}
      >
        {options.map((option, index) => {
          const isSelected = value === option;
          const optionId = `${uniqueId}-option-${index}`;
          const isFirst = index === 0;
          const isLast = index === options.length - 1;
          const isPrevOptionActive = index > 0 ? value === options[index - 1] : false;
          const isNextOptionActive = index < options.length - 1 ? value === options[index + 1] : false;
          
          return (
            <Segment
              key={option}
              isActive={isSelected}
              isFirst={isFirst}
              isLast={isLast}
              isPrevActive={isPrevOptionActive}
              isNextActive={isNextOptionActive}
              isFocused={focusedIndex === index}
              onClick={() => !disabled && onChange(option)}
              aria-checked={isSelected}
              disabled={disabled}
              orientation={orientation}
              tabIndex={-1} // Remove from tab order since we're using radio inputs
            >
              {/* Hidden radio input to handle native keyboard navigation */}
              <HiddenRadio
                ref={(el: HTMLInputElement | null) => { radioRefs.current[index] = el; }}
                type="radio"
                name={uniqueId}
                id={optionId}
                value={option}
                checked={isSelected}
                onChange={() => !disabled && onChange(option)}
                onFocus={() => handleFocus(index)}
                onBlur={handleBlur}
                disabled={disabled}
                tabIndex={isSelected || (index === 0 && !value) ? 0 : -1} // Only allow tabbing to the selected or first option
                aria-setsize={options.length} // Total number of items in the group
                aria-posinset={index + 1} // Position of this item in the group
              />
              {option}
            </Segment>
          );
        })}
      </SegmentedControl>
    </ControllerContainer>
  );
};

export default SegmentedController; 