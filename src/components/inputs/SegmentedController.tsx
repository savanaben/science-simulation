import React from 'react';
import styled from 'styled-components';

// Define the props for the SegmentedController component
interface SegmentedControllerProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
}

// Styled components for the SegmentedController
const ControllerContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const SegmentedControl = styled.div`
  display: flex;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #ccc;
`;

interface SegmentProps {
  isActive: boolean;
}

const Segment = styled.button<SegmentProps>`
  flex: 1;
  padding: 0.5rem;
  border: none;
  background-color: ${(props) => (props.isActive ? '#4a90e2' : 'white')};
  color: ${(props) => (props.isActive ? 'white' : '#333')};
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  
  &:not(:last-child) {
    border-right: 1px solid #ccc;
  }
  
  &:hover {
    background-color: ${(props) => (props.isActive ? '#4a90e2' : '#f0f0f0')};
  }
`;

/**
 * SegmentedController component for selecting from a set of options
 */
const SegmentedController: React.FC<SegmentedControllerProps> = ({
  label,
  options,
  value,
  onChange,
  id,
  className,
}) => {
  // Generate a unique ID if none is provided
  const uniqueId = id || `segmented-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <ControllerContainer className={className}>
      <Label id={`${uniqueId}-label`}>{label}</Label>
      <SegmentedControl role="radiogroup" aria-labelledby={`${uniqueId}-label`}>
        {options.map((option) => (
          <Segment
            key={option}
            isActive={value === option}
            onClick={() => onChange(option)}
            role="radio"
            aria-checked={value === option}
          >
            {option}
          </Segment>
        ))}
      </SegmentedControl>
    </ControllerContainer>
  );
};

export default SegmentedController; 