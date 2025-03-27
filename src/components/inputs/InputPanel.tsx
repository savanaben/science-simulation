import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Dropdown from './Dropdown';
import Slider from './Slider';
import SegmentedController from './SegmentedController';
import { SimulationConfig, InputConfig, InputControlType } from '../../config/simulationConfig';

// Define the props for the InputPanel component
interface InputPanelProps {
  simulationConfig: SimulationConfig;
  onInputChange: (inputId: string, value: string | number) => void;
  isSimulationRunning?: boolean;
  className?: string;
}

// Styled components for the InputPanel
const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 1.3rem;
  }
`;

/**
 * InputPanel component that dynamically renders input controls
 * based on the simulation configuration
 */
const InputPanel: React.FC<InputPanelProps> = ({
  simulationConfig,
  onInputChange,
  isSimulationRunning,
  className,
}) => {
  // State to track all input values
  const [inputValues, setInputValues] = useState<Record<string, string | number>>({});
  // Ref to track if initial values have been set
  const initializedRef = useRef(false);
  
  // Initialize input values from default values in the configuration
  useEffect(() => {
    // Skip if already initialized for this simulation config
    if (initializedRef.current) return;
    
    const initialValues: Record<string, string | number> = {};
    
    simulationConfig.inputs.forEach(input => {
      initialValues[input.id] = input.defaultValue;
    });
    
    setInputValues(initialValues);
    
    // Notify parent component of initial values
    Object.entries(initialValues).forEach(([inputId, value]) => {
      onInputChange(inputId, value);
    });
    
    // Mark as initialized
    initializedRef.current = true;
  }, [simulationConfig, onInputChange]);
  
  // Reset initialization flag when simulation config changes
  useEffect(() => {
    initializedRef.current = false;
  }, [simulationConfig.id]);
  
  // Handle input change
  const handleInputChange = (inputId: string, value: string | number) => {
    setInputValues(prev => ({
      ...prev,
      [inputId]: value,
    }));
    
    onInputChange(inputId, value);
  };
  
  // Render an input control based on its type
  const renderInputControl = (input: InputConfig) => {
    const value = inputValues[input.id] !== undefined ? inputValues[input.id] : input.defaultValue;
    
    switch (input.controlType) {
      case InputControlType.Dropdown:
        return (
          <Dropdown
            key={input.id}
            label={input.label}
            options={input.options || []}
            value={value as string}
            onChange={(newValue) => handleInputChange(input.id, newValue)}
            disabled={isSimulationRunning}
          />
        );
        
      case InputControlType.Slider:
        return (
          <Slider
            key={input.id}
            label={input.label}
            min={input.min || 0}
            max={input.max || 100}
            step={input.step || 1}
            value={value as number}
            onChange={(newValue) => handleInputChange(input.id, newValue)}
            disabled={isSimulationRunning}
          />
        );
        
      case InputControlType.SegmentedController:
        return (
          <SegmentedController
            key={input.id}
            label={input.label}
            options={input.options || []}
            value={value as string}
            onChange={(newValue) => handleInputChange(input.id, newValue)}
            orientation={input.orientation}
            disabled={isSimulationRunning}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <Panel className={className}>
      {simulationConfig.inputs.map(renderInputControl)}
    </Panel>
  );
};

export default InputPanel; 