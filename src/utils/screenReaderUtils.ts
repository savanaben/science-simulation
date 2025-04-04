import { SimulationConfig } from '../config/simulationConfig';
import { getAnimationDescription } from './simulationData';

/**
 * Create an accessible live region element for screen reader announcements
 * @returns HTMLElement for screen reader announcements
 */
const getScreenReaderAnnouncer = (): HTMLElement => {
  // Check if an announcer already exists
  let announcer = document.getElementById('screen-reader-announcer');
  
  if (!announcer) {
    // Create a new announcer element
    announcer = document.createElement('div');
    announcer.id = 'screen-reader-announcer';
    announcer.setAttribute('aria-live', 'assertive');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.setAttribute('role', 'status');
    announcer.className = 'sr-only';
    
    // Style it to be visually hidden but accessible to screen readers
    announcer.style.position = 'absolute';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.padding = '0';
    announcer.style.margin = '-1px';
    announcer.style.overflow = 'hidden';
    announcer.style.clip = 'rect(0, 0, 0, 0)';
    announcer.style.whiteSpace = 'nowrap';
    announcer.style.border = '0';
    
    // Add it to the DOM
    document.body.appendChild(announcer);
  }
  
  return announcer;
};

/**
 * Announce text to screen readers
 * @param text The text to announce
 */
export const announceToScreenReader = (text: string): void => {
  const announcer = getScreenReaderAnnouncer();
  
  // Clear any existing content (this helps ensure new identical messages are announced)
  announcer.textContent = '';
  
  // Use setTimeout to ensure the clearing takes effect before adding new content
  setTimeout(() => {
    announcer.textContent = text;
  }, 50);
};

/**
 * Generate the input summary text for screen readers
 * @param simulationConfig The current simulation configuration
 * @param inputValues The current input values
 * @returns Text describing the input values
 */
export const generateInputSummary = (
  simulationConfig: SimulationConfig,
  inputValues: Record<string, string | number>
): string => {
  const inputDescriptions = simulationConfig.inputs.map(input => {
    const value = inputValues[input.id];
    if (value !== undefined && value !== '') {
      return `${input.label} set to ${value}.`;
    }
    return '';
  }).filter(description => description !== '');
  
  return inputDescriptions.join(' ');
};

/**
 * Generate the complete simulation announcement for screen readers
 * @param simulationConfig The current simulation configuration
 * @param inputValues The current input values
 * @param trialNumber The current trial number
 * @param rowNumber The row number in the table
 * @returns Complete announcement text
 */
export const generateSimulationAnnouncement = (
  simulationConfig: SimulationConfig,
  inputValues: Record<string, string | number>,
  trialNumber: number
): string => {
  // Part 1: Input summary
  const inputSummary = generateInputSummary(simulationConfig, inputValues);
  
  // Part 2: Animation description
  const animationDescription = getAnimationDescription(simulationConfig.id, inputValues) || 
    "The simulation runs with the given parameters.";
  
  // Part 3: Starting information
  const startInfo = `Starting trial ${trialNumber}`;
  
  // Combine all parts (without completion info)
  return `${inputSummary} ${startInfo}${animationDescription}`;
};

/**
 * Generate the completion announcement for when the animation finishes
 * @param trialNumber The trial number that was completed
 * @param rowNumber The row number in the table where the data was added
 * @returns Completion announcement text
 */
export const generateCompletionAnnouncement = (
  trialNumber: number,
  rowNumber: number
): string => {
  return `Trial ${trialNumber} simulation complete. Results have been added to the data table in row ${rowNumber}.`;
}; 