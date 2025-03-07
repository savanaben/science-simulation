// import { SimulationConfig } from '../config/simulationConfig'; // Removed unused import

/**
 * This file contains the mapping between input combinations and output values.
 * In a real application, this could be loaded from an API or a database.
 */

// Define the structure of a simulation mapping
export interface SimulationMapping {
  inputs: Record<string, string | number>;
  outputs: Record<string, number>;
}

// Define the structure of a simulation data set
export interface SimulationDataSet {
  simulationId: string;
  mappings: SimulationMapping[];
}

// Plant Growth Simulation Data
const plantGrowthData: SimulationDataSet = {
  simulationId: 'plant-growth',
  mappings: [
    // All high inputs
    {
      inputs: {
        sunlightIntensity: 'High',
        waterAmount: 'High',
        soilNutrition: 'High',
      },
      outputs: {
        plantsGrown: 100,
      },
    },
    // All medium inputs
    {
      inputs: {
        sunlightIntensity: 'Medium',
        waterAmount: 'Medium',
        soilNutrition: 'Medium',
      },
      outputs: {
        plantsGrown: 50,
      },
    },
    // All low inputs
    {
      inputs: {
        sunlightIntensity: 'Low',
        waterAmount: 'Low',
        soilNutrition: 'Low',
      },
      outputs: {
        plantsGrown: 10,
      },
    },
    // High sunlight, medium water, medium soil
    {
      inputs: {
        sunlightIntensity: 'High',
        waterAmount: 'Medium',
        soilNutrition: 'Medium',
      },
      outputs: {
        plantsGrown: 70,
      },
    },
    // Medium sunlight, high water, medium soil
    {
      inputs: {
        sunlightIntensity: 'Medium',
        waterAmount: 'High',
        soilNutrition: 'Medium',
      },
      outputs: {
        plantsGrown: 65,
      },
    },
    // Medium sunlight, medium water, high soil
    {
      inputs: {
        sunlightIntensity: 'Medium',
        waterAmount: 'Medium',
        soilNutrition: 'High',
      },
      outputs: {
        plantsGrown: 75,
      },
    },
    // Low sunlight, high water, high soil
    {
      inputs: {
        sunlightIntensity: 'Low',
        waterAmount: 'High',
        soilNutrition: 'High',
      },
      outputs: {
        plantsGrown: 40,
      },
    },
    // High sunlight, low water, high soil
    {
      inputs: {
        sunlightIntensity: 'High',
        waterAmount: 'Low',
        soilNutrition: 'High',
      },
      outputs: {
        plantsGrown: 45,
      },
    },
    // High sunlight, high water, low soil
    {
      inputs: {
        sunlightIntensity: 'High',
        waterAmount: 'High',
        soilNutrition: 'Low',
      },
      outputs: {
        plantsGrown: 55,
      },
    },
  ],
};

// Weather Simulation Data
const weatherData: SimulationDataSet = {
  simulationId: 'weather',
  mappings: [
    // Example mapping for weather simulation
    {
      inputs: {
        temperature: 70,
        humidity: 50,
        pressure: 'Normal',
      },
      outputs: {
        precipitation: 10,
        windSpeed: 5,
      },
    },
    // Add more mappings as needed
  ],
};

// Collection of all simulation data sets
export const simulationDataSets: SimulationDataSet[] = [
  plantGrowthData,
  weatherData,
];

/**
 * Get the simulation data set for a specific simulation
 */
export const getSimulationDataSet = (simulationId: string): SimulationDataSet | undefined => {
  return simulationDataSets.find(dataSet => dataSet.simulationId === simulationId);
};

/**
 * Get the output values for a given set of inputs
 */
export const getOutputValues = (
  simulationId: string,
  inputValues: Record<string, string | number>
): Record<string, number> => {
  // Get the simulation data set
  const dataSet = getSimulationDataSet(simulationId);
  
  if (!dataSet) {
    console.error(`No data set found for simulation ID: ${simulationId}`);
    return {};
  }
  
  // Filter out empty values
  const filteredInputValues: Record<string, string | number> = {};
  Object.entries(inputValues).forEach(([key, value]) => {
    if (value !== '') {
      filteredInputValues[key] = value;
    }
  });
  
  // If all inputs are empty, return empty object
  if (Object.keys(filteredInputValues).length === 0) {
    console.warn('All inputs are empty');
    return {};
  }
  
  // Find the mapping that matches the inputs
  const mapping = dataSet.mappings.find(mapping => {
    // Check if all non-empty input values match
    return Object.entries(filteredInputValues).every(([key, value]) => {
      return mapping.inputs[key] === value;
    });
  });
  
  // If no mapping is found, return default values (empty object)
  if (!mapping) {
    console.warn(`No mapping found for inputs: ${JSON.stringify(filteredInputValues)}`);
    return {};
  }
  
  return mapping.outputs;
}; 