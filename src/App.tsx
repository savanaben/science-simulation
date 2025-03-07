import { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import InputPanel from './components/inputs/InputPanel';
import RiveAnimation, { RiveAnimationRef } from './components/visualization/RiveAnimation';
import TrialsTable from './components/trials/TrialsTable';
import { Trial } from './components/trials/TrialsTable';
import { getOutputValues } from './utils/simulationData';
import { getSimulationById, defaultSimulationId, simulations } from './config/simulationConfig';
import './App.css';
import Modal from './components/common/Modal';

// Styled components for the App
const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Arial', sans-serif;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
`;

const MainContent = styled.main`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RunButton = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  width: 100%;
  
  &:hover {
    background-color: #45a049;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4d4f;
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

const SimulationSelector = styled.select`
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: white;
  font-size: 1rem;
  margin-bottom: 1rem;
  width: 100%;
`;

function App() {
  // State for the current simulation
  const [currentSimulationId, setCurrentSimulationId] = useState(defaultSimulationId);
  
  // Get the current simulation configuration
  const simulationConfig = getSimulationById(currentSimulationId);
  
  // State for input values
  const [inputValues, setInputValues] = useState<Record<string, string | number>>({});
  
  // State for trials
  const [trials, setTrials] = useState<Trial[]>([]);
  const [nextTrialId, setNextTrialId] = useState(1);
  
  // State for validation error
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // State for max trials modal
  const [isMaxTrialsModalOpen, setIsMaxTrialsModalOpen] = useState(false);
  
  // Reference to the Rive animation component
  const riveAnimationRef = useRef<RiveAnimationRef>(null);

  // Initialize input values when the simulation changes
  useEffect(() => {
    if (!simulationConfig) return;
    
    const initialValues: Record<string, string | number> = {};
    
    simulationConfig.inputs.forEach(input => {
      initialValues[input.id] = input.defaultValue;
    });
    
    setInputValues(initialValues);
    setValidationError(null);
  }, [currentSimulationId, simulationConfig]);

  // Handle simulation change
  const handleSimulationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentSimulationId(e.target.value);
    setTrials([]); // Clear trials when changing simulations
    setNextTrialId(1);
    setValidationError(null);
  };

  // Handle input changes - use useCallback to prevent recreation on each render
  const handleInputChange = useCallback((inputId: string, value: string | number) => {
    setInputValues(prev => ({
      ...prev,
      [inputId]: value,
    }));
    setValidationError(null);
  }, []);

  // Check if all required inputs have values
  const areAllInputsSelected = () => {
    if (!simulationConfig) return false;
    
    return simulationConfig.inputs.every(input => {
      const value = inputValues[input.id];
      return value !== undefined && value !== '';
    });
  };

  // Run a simulation trial
  const runSimulation = () => {
    if (!simulationConfig) return;
    
    // Validate that all inputs have values
    if (!areAllInputsSelected()) {
      setValidationError('Please select values for all inputs before running the simulation.');
      return;
    }
    
    // Check if we've reached the maximum number of trials
    if (trials.length >= simulationConfig.maxTrials) {
      // Show the max trials modal
      setIsMaxTrialsModalOpen(true);
      return;
    }
    
    setValidationError(null);
    
    // Get output values based on inputs
    const outputs = getOutputValues(currentSimulationId, inputValues);
    
    // If no outputs were found, create default outputs with 0 values
    const defaultOutputs: Record<string, number> = {};
    if (Object.keys(outputs).length === 0) {
      simulationConfig.outputs.forEach(output => {
        defaultOutputs[output.id] = 0;
      });
    }
    
    // Create a new trial
    const newTrial: Trial = {
      id: nextTrialId,
      timestamp: new Date(),
      inputs: { ...inputValues },
      outputs: Object.keys(outputs).length > 0 ? outputs : defaultOutputs,
    };
    
    // Add the trial to the list
    setTrials(prev => [...prev, newTrial]);
    
    // Increment the trial ID
    setNextTrialId(prev => prev + 1);
    
    // Use the combined reset and play method for the Rive animation
    if (riveAnimationRef.current) {
      console.log('Triggering reset and play animation with inputs:', inputValues);
      riveAnimationRef.current.resetAndPlayAnimation();
    }
  };

  // Delete a trial
  const deleteTrial = (id: number) => {
    setTrials(prev => prev.filter(trial => trial.id !== id));
  };

  // If no simulation config is found, show an error
  if (!simulationConfig) {
    return (
      <AppContainer>
        <Header>
          <Title>Science Simulation Tool</Title>
          <Subtitle>Error: Simulation not found</Subtitle>
        </Header>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Header>
        <Title>Science Simulation Tool</Title>
        {/* <Subtitle>Explore scientific concepts through interactive simulations</Subtitle> */}
      </Header>
      
      <SimulationSelector 
        value={currentSimulationId} 
        onChange={handleSimulationChange}
      >
        {simulations.map(sim => (
          <option key={sim.id} value={sim.id}>
            {sim.name}
          </option>
        ))}
      </SimulationSelector>
      
      <MainContent>
        <div>
          <InputPanel 
            simulationConfig={simulationConfig} 
            onInputChange={handleInputChange} 
          />
          <RunButton 
            onClick={runSimulation} 
            disabled={!areAllInputsSelected()}
          >
            Run Simulation
          </RunButton>
          {validationError && <ErrorMessage>{validationError}</ErrorMessage>}
        </div>
        
        <RiveAnimation
          ref={riveAnimationRef}
          simulationConfig={simulationConfig}
          inputValues={inputValues}
        />
      </MainContent>
      
      <TrialsTable 
        simulationConfig={simulationConfig}
        trials={trials} 
        onDeleteTrial={deleteTrial} 
      />
      
      {/* Max Trials Modal */}
      <Modal
        isOpen={isMaxTrialsModalOpen}
        onClose={() => setIsMaxTrialsModalOpen(false)}
        title="Maximum Trials Reached"
      >
        <p>
          You have reached the maximum number of trials ({simulationConfig?.maxTrials}).
          Please delete one or more existing trials before running a new simulation.
        </p>
      </Modal>
    </AppContainer>
  );
}

export default App;
