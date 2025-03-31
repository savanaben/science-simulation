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
import ThemeToggle from './components/common/ThemeToggle';
import { announceToScreenReader, generateSimulationAnnouncement, generateCompletionAnnouncement } from './utils/screenReaderUtils';

// Styled components for the App
const AppContainer = styled.div`
  margin: 0 auto;
  background-color: ${props => props.theme.colors.background.main};
  color: ${props => props.theme.colors.text.primary};
  min-height: 100vh;
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const Header = styled.header`
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1rem 0 1rem;
`;

// Two-panel layout container
const TwoPanelLayout = styled.div`
  display: flex;
  max-width: 1366px;
  margin: 0 auto;

  padding: 26.66px 0px;
  
  @media (max-width: 992px) {
    flex-direction: column;
  }
`;

const LeftPanel = styled.div`
  width: 60%;
  padding: 0px 46.66px;
  box-shadow: 8px 0 8px -8px #aaa;
  
  @media (max-width: 992px) {
    width: auto;
    box-shadow: none;
    padding: 0px 1rem;

  }
`;

const RightPanel = styled.div`
  width: 40%;
  padding: 0px 46.66px;
  
  @media (max-width: 992px) {
    width: auto;
    padding: 0px 1rem;
  }
`;

const SimulationWrapper = styled.div`
  border: 1px solid ${props => props.theme.colors.border.main};
  border-radius: ${props => props.theme.borderRadius};
  background-color: ${props => props.theme.colors.background.surface};
  padding: 0.75rem;
  transition: background-color 0.3s ease, border-color 0.3s ease;

  margin: 0 auto;
  container-type: inline-size;
  container-name: simulation-container;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 1.1rem;
`;

const MainContent = styled.main`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
  margin-bottom: 1rem;

  /* Using container query with named container */
  @container simulation-container (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const SimulationGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  
  @container simulation-container (max-width: 600px) {
    width: 100%;
  }
`;

const InputTitle = styled.h2`
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  text-align: left;
  color: ${props => props.theme.colors.text.primary};
`;

const Description = styled.p`
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: ${props => props.theme.colors.text.secondary};
`;

const RunButton = styled.button`
  background-color: ${props => props.theme.colors.primaryBlue.button};
  color: ${props => props.theme.colors.text.onPrimary};
  border: 2px solid ${props => props.theme.colors.primaryBlue.border};
  border-radius: ${props => props.theme.borderRadius};
  padding: 8px 12px;
  font-size: 1rem;
  width: fit-content;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.2s, border-color 0.2s, box-shadow 0.2s, color 0.2s;
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryBlue.hover};
    border-color: ${props => props.theme.colors.primaryBlue.hover};
    box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.25);
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.background.disabled};
    border-color: ${props => props.theme.colors.background.disabled};
    cursor: not-allowed;
    box-shadow: none;
    color: ${props => props.theme.colors.text.disabled};
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

const SimulationSelector = styled.select`
  padding: 0.5rem;
  border-radius: ${props => props.theme.borderRadius};
  border: 1px solid ${props => props.theme.colors.border.input};
  background-color: ${props => props.theme.colors.background.input};
  color: ${props => props.theme.colors.text.primary};
  font-size: 1rem;
  margin-right: 1rem;
  width: 100%;
`;

const ContextText = styled.div`
  color: ${props => props.theme.colors.text.primary};
`;

const SectionTitle = styled.h2`
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 1rem;
  font-size: 1.3rem;
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
  
  // State to track if simulation is running
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  
  // State to track if we've already auto-scrolled for the first trial
  const [hasAutoScrolled, setHasAutoScrolled] = useState(false);
  
  // Reference to the Rive animation component
  const riveAnimationRef = useRef<RiveAnimationRef>(null);
  
  // Reference to the trials table component
  const trialsTableRef = useRef<HTMLDivElement>(null);

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
    
    // Set simulation running state to true
    setIsSimulationRunning(true);
    
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
    
    // Announce to screen readers immediately when the button is clicked
    // The row number will be the current trials length + 1
    const rowNumber = trials.length + 1;
    const announcement = generateSimulationAnnouncement(
      simulationConfig,
      inputValues,
      nextTrialId,
      rowNumber
    );
    
    announceToScreenReader(announcement);
    
    // Use the combined reset and play method for the Rive animation
    if (riveAnimationRef.current) {
      console.log('Triggering reset and play animation with inputs:', inputValues);
      riveAnimationRef.current.resetAndPlayAnimation();
      
      // Delay adding the trial data until after the animation completes
      // 500ms initial delay + animation duration + 500ms pause
      const totalDelay = 600 + simulationConfig.animationDuration + 800;
      
      setTimeout(() => {
        // Add the trial to the list
        setTrials(prev => [...prev, newTrial]);
        
        // Increment the trial ID
        setNextTrialId(prev => prev + 1);
        
        // Set simulation running state to false
        setIsSimulationRunning(false);
        
        // Auto-scroll to the trials table for the first trial only
        if (!hasAutoScrolled && trialsTableRef.current) {
          trialsTableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setHasAutoScrolled(true);
        }
        
        // The initial screen reader announcement is done at button click,
        // but we also announce the completion
        const completionAnnouncement = generateCompletionAnnouncement(
          nextTrialId,
          rowNumber
        );
        announceToScreenReader(completionAnnouncement);
        
        console.log('Trial data added after animation completed');
      }, totalDelay);
    } else {
      // Fallback if animation ref is not available - add trial immediately
      setTrials(prev => [...prev, newTrial]);
      setNextTrialId(prev => prev + 1);
      setIsSimulationRunning(false);
      
      // The initial screen reader announcement is already handled above
      // Add a completion announcement for the fallback case as well
      setTimeout(() => {
        const rowNumber = trials.length + 1;
        const completionAnnouncement = generateCompletionAnnouncement(
          nextTrialId,
          rowNumber
        );
        announceToScreenReader(completionAnnouncement);
      }, 1000); // Short delay to separate the two announcements
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
        <ThemeToggle />
      </Header>
      
      <TwoPanelLayout>
        <LeftPanel>
          <ContextText>
            <SectionTitle>Simulation Context</SectionTitle>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor.</p>
            <p>Suspendisse in orci enim. Etiam gravida euismod ultricies. Donec congue mattis ligula non maximus. Suspendisse potenti. Aliquam dignissim pulvinar ex, a pretium felis vehicula quis.</p>
          </ContextText>
          <SimulationWrapper>
            <MainContent>
              <InputContainer>
                <InputTitle>{simulationConfig.name}</InputTitle>
                {simulationConfig.description && (
                  <Description>{simulationConfig.description}</Description>
                )}
                
                <InputPanel 
                  simulationConfig={simulationConfig} 
                  onInputChange={handleInputChange} 
                  isSimulationRunning={isSimulationRunning}
                />
                <RunButton 
                  onClick={runSimulation} 
                  disabled={!areAllInputsSelected() || isSimulationRunning}
                  aria-label="Run Simulation with current inputs"
                >
                  Run Simulation
                </RunButton>
                {validationError && <ErrorMessage>{validationError}</ErrorMessage>}
              </InputContainer>
              
              <SimulationGroup>
                <RiveAnimation
                  ref={riveAnimationRef}
                  simulationConfig={simulationConfig}
                  inputValues={inputValues}
                />
              </SimulationGroup>
            </MainContent>
            
            <TrialsTable 
              simulationConfig={simulationConfig}
              trials={trials} 
              onDeleteTrial={deleteTrial}
              ref={trialsTableRef}
            />
          </SimulationWrapper>
        </LeftPanel>
        
        <RightPanel>
          <SectionTitle>Additional Information</SectionTitle>
          <ContextText>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nibh augue, suscipit a, scelerisque sed, lacinia in, mi. Cras vel lorem. Etiam pellentesque aliquet tellus. Phasellus pharetra nulla ac diam.</p>
            
            <p>Quisque semper justo at risus. Donec venenatis, turpis vel hendrerit interdum, dui ligula ultricies purus, sed posuere libero dui id orci. Nam congue, pede vitae dapibus aliquet, elit magna vulputate arcu, vel tempus metus leo non est.</p>
            
            <p>Etiam sit amet lectus quis est congue mollis. Phasellus congue lacus eget neque. Phasellus ornare, ante vitae consectetuer consequat, purus sapien ultricies dolor, et mollis pede metus eget nisi.</p>
            
          </ContextText>
        </RightPanel>
      </TwoPanelLayout>
      
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
