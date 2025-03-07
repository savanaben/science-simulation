import React from 'react';
import styled from 'styled-components';

// Define the props for the Slider component
interface SliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  id?: string;
  className?: string;
}

// Styled components for the Slider
const SliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const SliderInput = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #ddd;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #4a90e2;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #4a90e2;
    cursor: pointer;
  }
`;

const ValueDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #666;
`;

/**
 * Slider component for selecting a numeric value within a range
 */
const Slider: React.FC<SliderProps> = ({
  label,
  min,
  max,
  step,
  value,
  onChange,
  id,
  className,
}) => {
  // Generate a unique ID if none is provided
  const uniqueId = id || `slider-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <SliderContainer className={className}>
      <Label htmlFor={uniqueId}>{label}: {value}</Label>
      <SliderInput
        id={uniqueId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <ValueDisplay>
        <span>{min}</span>
        <span>{max}</span>
      </ValueDisplay>
    </SliderContainer>
  );
};

export default Slider; 