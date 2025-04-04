import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import styled from 'styled-components';
import { SimulationConfig, InputConfig } from '../../config/simulationConfig';
// Import Rive types for proper type checking
import { Fit, Alignment, Layout } from '@rive-app/react-canvas';

// Define the props for the RiveAnimation component
interface RiveAnimationProps {
  simulationConfig: SimulationConfig;
  inputValues: Record<string, string | number>;
  className?: string;
}

// Define the ref methods that can be called from parent components
export interface RiveAnimationRef {
  playAnimation: () => void;
  resetAnimation: () => void;
  resetAndPlayAnimation: () => void;
}

// Add the Title styled component
const Title = styled.h2`
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  text-align: left;
`;

// Styled container for the Rive animation
const AnimationContainer = styled.div`
  width: 100%;
  max-height: 380px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  
  
  /* Ensure the container maintains aspect ratio */
  aspect-ratio: 1 / 1;
  
  @media (max-width: 768px) {
    width: 100%;
    
  }
`;

const CoverImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

interface CanvasWrapperProps {
  isResetting: boolean;
}

const CanvasWrapper = styled.div<CanvasWrapperProps>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: ${props => props.isResetting ? 0 : 1};
  transition: opacity 0.3s ease-in-out;
`;

// Placeholder message when Rive is loading or not available
const PlaceholderMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

/**
 * RiveAnimation component that displays a Rive animation
 * based on the simulation configuration and input values
 */
const RiveAnimation = forwardRef<RiveAnimationRef, RiveAnimationProps>(({
  simulationConfig,
  inputValues,
  className,
}, ref) => {
  // Reference to the canvas element
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Reference to the Rive instance
  const riveInstanceRef = useRef<any>(null);
  // State to track if Rive is loaded
  const [isLoaded, setIsLoaded] = useState(false);
  // State to track loading errors
  const [error, setError] = useState<string | null>(null);
  // State to track if we're attempting to load Rive
  const [isAttemptingLoad, setIsAttemptingLoad] = useState(false);
  // Reference to store state machine inputs
  const stateMachineInputsRef = useRef<any[]>([]);
  // Add state for canvas visibility during reset
  const [isResetting, setIsResetting] = useState(false);

  // Expose methods to parent components via ref
  useImperativeHandle(ref, () => ({
    resetAnimation: () => {
      if (riveInstanceRef.current && isLoaded) {
        try {
          console.log('Resetting Rive animation');
          // Reset the artboard to its initial state
          if (typeof riveInstanceRef.current.reset === 'function') {
            riveInstanceRef.current.reset();
            console.log('Animation reset successful');
            
            // Reinitialize state machine inputs after reset
            try {
              const inputs = riveInstanceRef.current.stateMachineInputs(simulationConfig.stateMachine);
              if (inputs) {
                stateMachineInputsRef.current = inputs;
                console.log('State machine inputs reinitialized after reset:', inputs);
                
                // Immediately update inputs with current values
                setTimeout(() => {
                  updateRiveInputs();
                }, 0);
              } else {
                console.warn('No state machine inputs found after reset');
              }
            } catch (inputErr) {
              console.error('Error reinitializing state machine inputs after reset:', inputErr);
            }
          } else {
            console.warn('Reset method not available, trying alternative approach');
            // Alternative approach: stop the animation
            if (riveInstanceRef.current.isPlaying) {
              riveInstanceRef.current.stop();
              console.log('Animation stopped as fallback for reset');
            }
          }
        } catch (err) {
          console.error('Error resetting animation:', err);
        }
      } else {
        console.warn('Rive instance not ready for reset');
      }
    },
    
    playAnimation: () => {
      if (riveInstanceRef.current && isLoaded) {
        // Ensure we have valid state machine inputs
        if (!stateMachineInputsRef.current || stateMachineInputsRef.current.length === 0) {
          try {
            console.log('Attempting to reinitialize state machine inputs before playing');
            const inputs = riveInstanceRef.current.stateMachineInputs(simulationConfig.stateMachine);
            if (inputs) {
              stateMachineInputsRef.current = inputs;
              console.log('Successfully reinitialized state machine inputs:', inputs);
            }
          } catch (err) {
            console.error('Failed to reinitialize state machine inputs:', err);
          }
        }
        
        // Set the input values before playing
        updateRiveInputs();
        
        // Trigger the animation to play
        try {
          console.log('Triggering animation playback');
          
          // Simply play the animation - the inputs have already been set
          if (!riveInstanceRef.current.isPlaying) {
            riveInstanceRef.current.play();
            console.log('Started playing animation');
          } else {
            // If already playing, stop and restart to ensure it responds to new inputs
            riveInstanceRef.current.stop();
            riveInstanceRef.current.play();
            console.log('Restarted animation playback');
          }
        } catch (err) {
          console.error('Error triggering animation:', err);
          
          // Fallback: try a different approach if the above fails
          try {
            // Some versions of Rive might use a different API
            if (typeof riveInstanceRef.current.play !== 'function') {
              console.warn('Play method not found, trying alternative approach');
              // Try to access the animation instance directly
              const animator = riveInstanceRef.current.animator;
              if (animator) {
                animator.play();
                console.log('Playing animation via animator');
              }
            }
          } catch (playErr) {
            console.error('Failed to play animation:', playErr);
          }
        }
      } else {
        console.warn('Rive instance not ready');
      }
    },
    
    resetAndPlayAnimation: () => {
      if (riveInstanceRef.current && isLoaded) {
        console.log('Performing combined reset and play operation');
        
        try {
          // First show the cover image by hiding the canvas
          setIsResetting(true);
          
          // Wait for the fade out transition
          setTimeout(() => {
            // Stop any currently playing animation
            if (riveInstanceRef.current.isPlaying) {
              riveInstanceRef.current.stop();
            }
            
            // Clean up the existing instance
            riveInstanceRef.current.cleanup();
            
            // Import Rive dynamically
            import('@rive-app/react-canvas').then(({ Rive }) => {
              const canvas = canvasRef.current;
              if (!canvas) {
                console.error('Canvas not available for reset and play');
                return;
              }
              
              // Create a new Rive instance
              const r = new Rive({
                src: simulationConfig.riveFile,
                canvas: canvas,
                stateMachines: simulationConfig.stateMachine,
                autoplay: false,
                layout: new Layout({
                  fit: Fit.Contain,
                  alignment: Alignment.Center
                }),
                onLoad: () => {
                  console.log('Rive instance recreated successfully');
                  riveInstanceRef.current = r;
                  r.resizeDrawingSurfaceToCanvas();
                  
                  try {
                    const inputs = r.stateMachineInputs(simulationConfig.stateMachine);
                    if (inputs) {
                      stateMachineInputsRef.current = inputs;
                      updateRiveInputs();
                      
                      // Show the canvas again and play the animation
                      setIsResetting(false);
                      setTimeout(() => {
                        r.play();
                      }, 500); // Small delay to ensure the fade-in has started
                    }
                  } catch (err) {
                    console.error('Error getting state machine inputs:', err);
                    setIsResetting(false);
                  }
                },
                onLoadError: (err) => {
                  console.error('Error recreating Rive instance:', err);
                  setIsResetting(false);
                }
              });
            }).catch(err => {
              console.error('Error importing Rive for reset and play:', err);
              setIsResetting(false);
            });
          }, 300); // Match the CSS transition duration
        } catch (err) {
          console.error('Error in reset and play operation:', err);
          setIsResetting(false);
        }
      }
    }
  }));

  // Helper function to map a value to a numeric value for Rive
  const mapToRiveValue = (inputConfig: InputConfig, value: string | number): number | null => {
    // If the value is empty, return null (no value to set)
    if (value === '') {
      return null;
    }
    
    // If the value is already a number, return it
    if (typeof value === 'number') {
      return value;
    }
    
    // If there's a value mapping defined, use it
    if (inputConfig.valueMapping && inputConfig.valueMapping[value]) {
      return inputConfig.valueMapping[value];
    }
    
    // If no mapping is found, try to parse as a number
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      return parsed;
    }
    
    // If all else fails, return null
    console.warn(`No mapping found for value "${value}" in input "${inputConfig.id}"`);
    return null;
  };

  // Function to update Rive inputs based on current input values
  const updateRiveInputs = () => {
    const riveInstance = riveInstanceRef.current;
    if (!riveInstance || !isLoaded) return;

    try {
      // Get the inputs for the state machine
      const inputs = stateMachineInputsRef.current;
      if (!inputs || inputs.length === 0) {
        console.warn('No state machine inputs found');
        return;
      }

      // Log all current input values for debugging
      console.log('Current input values:', inputValues);

      // Loop through each input in the simulation configuration
      simulationConfig.inputs.forEach(inputConfig => {
        // Skip if no Rive input name is defined
        if (!inputConfig.riveInputName) return;
        
        // Get the current value for this input
        const value = inputValues[inputConfig.id];
        if (value === undefined) return;
        
        // Map the value to a numeric value for Rive
        const riveValue = mapToRiveValue(inputConfig, value);
        
        // Skip if the value is null (empty selection)
        if (riveValue === null) {
          console.log(`Skipping empty value for ${inputConfig.riveInputName}`);
          return;
        }
        
        // Find the corresponding input in the state machine
        const input = inputs.find(i => i.name === inputConfig.riveInputName);
        if (input) {
          // Set the value on the input
          input.value = riveValue;
          console.log(`Set state machine input ${inputConfig.riveInputName} to ${riveValue}`);
        } else {
          console.warn(`Could not find state machine input: ${inputConfig.riveInputName}`);
        }
      });
    } catch (error) {
      console.error('Error updating Rive inputs:', error);
    }
  };

  // Initialize Rive when the component mounts
  useEffect(() => {
    // Prevent multiple load attempts
    if (isAttemptingLoad) return;
    
    // Skip if no canvas or if already loaded
    if (!canvasRef.current || isLoaded) return;
    
    // Mark that we're attempting to load
    setIsAttemptingLoad(true);
    
    // Check if Rive file URL is valid
    if (!simulationConfig.riveFile || !simulationConfig.riveFile.trim()) {
      setError('No Rive animation file specified');
      setIsAttemptingLoad(false);
      return;
    }

    // Dynamic import of Rive to avoid TypeScript errors
    import('@rive-app/react-canvas').then(({ Rive }) => {
      if (!canvasRef.current) {
        setIsAttemptingLoad(false);
        return;
      }

      try {
        console.log('Initializing Rive with file:', simulationConfig.riveFile);
        console.log('State machine to use:', simulationConfig.stateMachine);
        
        // Create a new Rive instance
        const r = new Rive({
          src: simulationConfig.riveFile,
          canvas: canvasRef.current,
          stateMachines: simulationConfig.stateMachine,
          autoplay: false, // Don't play automatically
          // Use layout to control how the animation fits in the canvas
          layout: new Layout({
            fit: Fit.Contain,
            alignment: Alignment.Center
          }),
          onLoad: () => {
            console.log('Rive file loaded successfully');
            console.log('State machine name:', simulationConfig.stateMachine);
            
            // Use Rive's built-in method to handle high-DPI displays
            r.resizeDrawingSurfaceToCanvas();
            console.log('Canvas drawing surface resized for crisp rendering');
            
            setIsLoaded(true);
            riveInstanceRef.current = r;
            
            // Store the state machine inputs for later use
            try {
              // Log all available state machines for debugging
              const stateMachines = r.stateMachineNames;
              console.log('Available state machines:', stateMachines);
              
              // Check if our state machine exists
              if (!stateMachines.includes(simulationConfig.stateMachine)) {
                console.error(`State machine "${simulationConfig.stateMachine}" not found in available state machines:`, stateMachines);
                // Try to use the first available state machine as a fallback
                if (stateMachines.length > 0) {
                  console.log(`Falling back to first available state machine: ${stateMachines[0]}`);
                  // We can't change the config here, but we can log the correct name for debugging
                }
              }
              
              const inputs = r.stateMachineInputs(simulationConfig.stateMachine);
              if (inputs) {
                stateMachineInputsRef.current = inputs;
                console.log('State machine inputs:', inputs);
                
                // Log available input names for debugging
                inputs.forEach(input => {
                  console.log(`Available input: ${input.name}, type: ${input.type}`);
                });
              } else {
                console.warn('No state machine inputs found');
              }
            } catch (err) {
              console.error('Error getting state machine inputs:', err);
            }
            
            setIsAttemptingLoad(false);
          },
          onLoadError: (err) => {
            console.error('Error loading Rive file:', err);
            setError('Failed to load animation');
            setIsAttemptingLoad(false);
          },
        });

        // Cleanup function
        return () => {
          r.cleanup();
        };
      } catch (err) {
        console.error('Error initializing Rive:', err);
        setError('Failed to initialize animation');
        setIsAttemptingLoad(false);
      }
    }).catch(err => {
      console.error('Error importing Rive:', err);
      setError('Failed to load animation library');
      setIsAttemptingLoad(false);
    });
  }, [simulationConfig.riveFile, simulationConfig.stateMachine, isLoaded, isAttemptingLoad]);

  // Add a resize observer to handle canvas resizing
  useEffect(() => {
    if (!canvasRef.current || !isLoaded || !riveInstanceRef.current) return;
    
    // Function to handle resize
    const handleResize = () => {
      if (riveInstanceRef.current) {
        // Use Rive's built-in method to handle high-DPI displays
        riveInstanceRef.current.resizeDrawingSurfaceToCanvas();
        console.log('Canvas resized using Rive resizeDrawingSurfaceToCanvas');
      }
    };
    
    // Create a ResizeObserver to watch for container size changes
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    
    // Start observing the canvas's parent element
    if (canvasRef.current.parentElement) {
      resizeObserver.observe(canvasRef.current.parentElement);
    }
    
    // Also listen for window resize events
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [isLoaded]);

  // Update inputs when input values change
  useEffect(() => {
    // Only update inputs, don't play the animation
    if (isLoaded && riveInstanceRef.current) {
      updateRiveInputs();
    }
  }, [inputValues, isLoaded]);

  return (
    <>
      <Title>Simulation</Title>
      <AnimationContainer className={className}>
        <CoverImage 
          src={new URL('../../assets/img/rive_cover.png', import.meta.url).href} 
          alt="Simulation cover"
        />
        <CanvasWrapper isResetting={isResetting}>
          {error ? (
            <PlaceholderMessage>
              {error}. Please check the console for details.
            </PlaceholderMessage>
          ) : !isLoaded ? (
            <PlaceholderMessage>Loading animation...</PlaceholderMessage>
          ) : null}
          <canvas 
            ref={canvasRef} 
            width="800"
            height="800"
            style={{ 
              width: '100%', 
              height: '100%',
              display: 'block'
            }} 
          />
        </CanvasWrapper>
      </AnimationContainer>
    </>
  );
});

export default RiveAnimation; 