// Define the structure of a simulation input
export interface SimulationInput {
  name: string;
  value: string;
}

// Define the structure of a simulation output
export interface SimulationOutput {
  name: string;
  value: number;
}

// Define the structure of a simulation trial
export interface SimulationTrial {
  id: number;
  inputs: SimulationInput[];
  outputs: SimulationOutput[];
  timestamp: Date;
}

// Define the mapping between input combinations and output values
export interface SimulationMapping {
  inputs: {
    [key: string]: string;
  };
  outputs: {
    [key: string]: number;
  };
}

// Define the intensity levels
export type IntensityLevel = 'Low' | 'Medium' | 'High';

// Define the input names
export enum InputName {
  SunlightIntensity = 'sunlightIntensity',
  WaterAmount = 'waterAmount',
  SoilNutrition = 'soilNutrition',
}

// Define the output names
export enum OutputName {
  PlantsGrown = 'plantsGrown',
} 