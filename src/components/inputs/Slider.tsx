import React, { useMemo } from 'react';
import styled from 'styled-components';

// Define the props for the Slider component
interface SliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
}

// Styled components for the Slider
const SliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
    max-width: 250px;
    min-width: 200px;
    width: 100%;
  box-sizing: border-box;
`;

const Label = styled.label`
  font-weight: 400;

  font-size: 22px;
`;

const SliderTrack = styled.div`
  position: relative;
  width: 100%;
  box-sizing: border-box;
  height: 40px; /* Increase height for larger touch target */
  display: flex;
  align-items: center; /* Center the slider vertically */
`;

const SliderInputContainer = styled.div`
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
`;

const SliderInput = styled.input`
  -webkit-appearance: none;
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  width: 100%;
  height: 100%; /* Full height of container for larger touch target */
  box-shadow: none; /* Remove shadow since we'll add a visual track */
  border-radius: 6px;
  background: transparent; /* Make the input transparent */
  z-index: 2;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  cursor: pointer;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: #4a90e2;
    cursor: ew-resize;
    transition: transform 0.15s ease-out;
    transform: scale(1);
    margin-top: -6.5px; /* Adjust to center thumb on the visual track */
  }
  
  &::-moz-range-thumb {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: #4a90e2;
    cursor: ew-resize;
    transition: transform 0.15s ease-out;
    transform: scale(1);
  }
  
  &::-webkit-slider-runnable-track {
    height: 12px;
    background: #fff;
    border-radius: 6px;
    box-shadow: inset 0 0 0px 1px rgb(144, 144, 144);
  }
  
  &::-moz-range-track {
    height: 12px;
    background: #fff;
    border-radius: 6px;
    box-shadow: inset 0 0 0px 1px rgb(144, 144, 144);
  }
  
  &:active::-webkit-slider-thumb {
    transform: scale(1.2);
  }
  
  &:active::-moz-range-thumb {
    transform: scale(1.2);
  }
  
  &:focus:not(:active)::-webkit-slider-thumb {
    transform: scale(1);
  }
  
  &:focus:not(:active)::-moz-range-thumb {
    transform: scale(1);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

// Track for ticks that sits below the slider
const TickTrack = styled.div`
  position: relative;
  width: calc(100% - 25px); /* Account for the thumb width */
  margin: 0 12px; /* Center the tick track to match the thumb range */
  margin-bottom: 14px; /* Add space for the values below */
  top: -15px;
`;

const StepMarker = styled.div<{ position: string }>`
  position: absolute;
  top: 0;
  left: ${props => props.position};
  width: 1px;
  height: 12px;
  background-color: #888888;
  transform: translateX(-50%);
`;

const ValueDisplay = styled.div`
  position: relative;
  width: calc(100% - 25px); /* Match the tick track width */
  margin: 0 12px; /* Match the tick track margin */
  height: 8px; /* Make room for the values */
  top: -15px;
`;

interface StepValueProps {
  position: string;
  isSelected: boolean;
}

const StepValue = styled.span<StepValueProps>`
  position: absolute;
  top: 0; /* Position directly below the ticks */
  left: ${props => props.position};
  transform: translateX(-50%);
  color: #000;
  font-size: 22px;
  font-weight: ${props => props.isSelected ? 'bold' : 'normal'};
  text-align: center;
  white-space: nowrap; /* Prevent wrapping on small screens */
  transition: font-weight 0.1s ease-out;
`;

/**
 * Slider component for selecting a numeric value within a range
 */
const Slider: React.FC<SliderProps> = ({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  disabled,
  id,
  className,
}) => {
  // Generate a unique ID if none is provided
  const uniqueId = id || `slider-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  // Calculate all possible values based on min, max, and step
  const stepValues = useMemo(() => {
    const values = [];
    for (let i = min; i <= max; i += step) {
      values.push(i);
    }
    return values;
  }, [min, max, step]);
  
  // Calculate position for markers and labels in a more consistent way
  const calculateStepPosition = (stepValue: number) => {
    // Convert the value to a percentage of the slider range
    const percentage = (stepValue - min) / (max - min);
    
    // For a truly responsive approach, we use percentage positioning
    // This natural browser positioning works better across different widths
    return `${percentage * 100}%`;
  };
  
  return (
    <SliderContainer className={className}>
      <Label htmlFor={uniqueId}>{label}: {value}</Label>
      <SliderTrack>
        <SliderInputContainer>
          <SliderInput
            id={uniqueId}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            disabled={disabled}
          />
        </SliderInputContainer>
      </SliderTrack>
      
      <TickTrack>
        {stepValues.map((stepValue) => {
          const position = calculateStepPosition(stepValue);
          return (
            <StepMarker 
              key={stepValue} 
              position={position} 
            />
          );
        })}
      </TickTrack>
      
      <ValueDisplay>
        {stepValues.map((stepValue) => {
          const position = calculateStepPosition(stepValue);
          const isSelected = stepValue === value;
          return (
            <StepValue 
              key={stepValue} 
              position={position}
              isSelected={isSelected}
            >
              {stepValue}
            </StepValue>
          );
        })}
      </ValueDisplay>
    </SliderContainer>
  );
};

export default Slider; 