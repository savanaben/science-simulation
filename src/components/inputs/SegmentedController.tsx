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
  border: 2px solid rgb(144, 144, 144);
  width: fit-content;
  min-width: 150px;
`;

interface SegmentProps {
  isActive: boolean;
  disabled?: boolean;
  orientation: 'horizontal' | 'vertical';
  isFocused?: boolean;
}

const Segment = styled.button<SegmentProps>`
  flex: ${props => props.orientation === 'horizontal' ? '1' : 'initial'};
  padding: 0.5rem;
  border: none;
  border-radius: 0px;
  background-color: ${(props) => (props.isActive ? 'rgb(36, 120, 204)' : 'white')};
  color: ${(props) => (props.isActive ? 'white' : 'rgb(36, 120, 204)')}; /* Blue text when not active */
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: background-color 0.2s, color 0.2s;
  opacity: ${(props) => (props.disabled ? '0.6' : '1')};
  text-align: ${props => props.orientation === 'vertical' ? 'left' : 'center'};
  position: relative;
  
  /* Focus style when using keyboard navigation */
  ${props => props.isFocused && `
    outline: 2px solid rgb(0, 0, 0);
    outline-offset: -2px;
    z-index: 1;
  `}
  
  /* Add borders between segments */
  &:not(:last-child) {
    border-${props => props.orientation === 'horizontal' ? 'right' : 'bottom'}: 2px solid rgb(144, 144, 144);
  }
  
  &:hover {
    background-color: ${(props) => (props.isActive ? 'rgb(36, 120, 204)' : props.disabled ? 'white' : '#f0f0f0')};
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
          
          return (
            <Segment
              key={option}
              isActive={isSelected}
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