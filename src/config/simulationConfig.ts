// import { IntensityLevel } from '../types'; // Removed unused import

/**
 * This file contains the configuration for different simulations.
 * Each simulation can have different inputs, outputs, and Rive animations.
 */

// Define the types of input controls
export enum InputControlType {
  Dropdown = 'dropdown',
  Slider = 'slider',
  SegmentedController = 'segmentedController',
}

// Define the structure of an input configuration
export interface InputConfig {
  id: string;
  name: string;
  label: string;
  controlType: InputControlType;
  defaultValue: string | number;
  options?: string[]; // For dropdown and segmented controller
  min?: number; // For slider
  max?: number; // For slider
  step?: number; // For slider
  // Mapping to Rive input name
  riveInputName?: string;
  // Optional value mapping for string values to numbers
  valueMapping?: Record<string, number>;
}

// Define the structure of an output configuration
export interface OutputConfig {
  id: string;
  name: string;
  label: string;
  unit?: string;
}

// Define the structure of a simulation configuration
export interface SimulationConfig {
  id: string;
  name: string;
  description: string;
  riveFile: string;
  stateMachine: string;
  inputs: InputConfig[];
  outputs: OutputConfig[];
  maxTrials: number; // Maximum number of trials allowed
}

// Plant Growth Simulation Configuration
export const plantGrowthSimulation: SimulationConfig = {
  id: 'plant-growth',
  name: 'Plant Growth Simulation',
  description: 'Explore how different factors affect plant growth',
  riveFile: new URL('../assets/animations/plant_simulation_riv.riv', import.meta.url).href, // Updated to use file from src/assets
  stateMachine: 'State_Machine_1', // Correct state machine name
  inputs: [
    {
      id: 'sunlightIntensity',
      name: 'sunlightIntensity',
      label: 'Sunlight Intensity',
      controlType: InputControlType.Dropdown,
      defaultValue: '',
      options: ['Low', 'Medium', 'High'],
      // Correct Rive input name
      riveInputName: 'sunlight_intensity',
      // Mapping string values to numeric values for Rive
      valueMapping: {
        'Low': 1,
        'Medium': 2,
        'High': 3
      }
    },
    {
      id: 'waterAmount',
      name: 'waterAmount',
      label: 'Water Amount',
      controlType: InputControlType.Dropdown,
      defaultValue: '',
      options: ['Low', 'Medium', 'High'],
      // Correct Rive input name
      riveInputName: 'water_intensity',
      // Mapping string values to numeric values for Rive
      valueMapping: {
        'Low': 1,
        'Medium': 2,
        'High': 3
      }
    },
    {
      id: 'soilNutrition',
      name: 'soilNutrition',
      label: 'Soil Nutrition',
      controlType: InputControlType.Dropdown,
      defaultValue: '',
      options: ['Low', 'Medium', 'High'],
      // Correct Rive input name
      riveInputName: 'soil_nutrition',
      // Mapping string values to numeric values for Rive
      valueMapping: {
        'Low': 1,
        'Medium': 2,
        'High': 3
      }
    },
  ],
  outputs: [
    {
      id: 'plantsGrown',
      name: 'plantsGrown',
      label: 'Plants Grown',
      unit: 'plants',
    },
  ],
  maxTrials: 6, // Maximum of 6 trials allowed
};

// Example of a different simulation configuration
export const weatherSimulation: SimulationConfig = {
  id: 'weather',
  name: 'Weather Simulation',
  description: 'Explore how different factors affect weather patterns',
  riveFile: 'https://example.com/weather.riv', // Placeholder
  stateMachine: 'State_Machine_1', // Updated to match your state machine name
  inputs: [
    {
      id: 'temperature',
      name: 'temperature',
      label: 'Temperature',
      controlType: InputControlType.Slider,
      defaultValue: 70,
      min: 0,
      max: 100,
      step: 1,
      // Mapping to Rive input name
      riveInputName: 'temperature',
      // For sliders, we don't need a value mapping as the numeric value can be used directly
    },
    {
      id: 'humidity',
      name: 'humidity',
      label: 'Humidity',
      controlType: InputControlType.Slider,
      defaultValue: 50,
      min: 0,
      max: 100,
      step: 1,
      // Mapping to Rive input name
      riveInputName: 'humidity',
    },
    {
      id: 'pressure',
      name: 'pressure',
      label: 'Pressure',
      controlType: InputControlType.SegmentedController,
      defaultValue: '',
      options: ['Low', 'Normal', 'High'],
      // Mapping to Rive input name
      riveInputName: 'pressure',
      // Mapping string values to numeric values for Rive
      valueMapping: {
        'Low': 1,
        'Normal': 2,
        'High': 3
      }
    },
  ],
  outputs: [
    {
      id: 'precipitation',
      name: 'precipitation',
      label: 'Precipitation',
      unit: 'mm',
    },
    {
      id: 'windSpeed',
      name: 'windSpeed',
      label: 'Wind Speed',
      unit: 'mph',
    },
  ],
  maxTrials: 6, // Maximum of 6 trials allowed
};

// Collection of all available simulations
export const simulations: SimulationConfig[] = [
  plantGrowthSimulation,
  weatherSimulation,
];

// Get a simulation configuration by ID
export const getSimulationById = (id: string): SimulationConfig | undefined => {
  return simulations.find(simulation => simulation.id === id);
};

// Default simulation ID
export const defaultSimulationId = plantGrowthSimulation.id; 