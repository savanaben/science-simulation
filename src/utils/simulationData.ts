// import { SimulationConfig } from '../config/simulationConfig'; // Removed unused import

/**
 * This file contains the mapping between input combinations and output values.
 * In a real application, this could be loaded from an API or a database.
 */

// Define the structure of a simulation mapping
export interface SimulationMapping {
  inputs: Record<string, string | number>;
  outputs: Record<string, number>;
  animationDescription?: string; // Description of what happens in the animation for screen readers
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
      animationDescription: "The plant grows rapidly with bright sunshine, plenty of water, and nutrient-rich soil. It develops a strong stem, lush green leaves, and multiple flowers blooming at the top."
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
      animationDescription: "The plant grows at a moderate pace with adequate sunlight, water, and soil nutrition. It develops a healthy stem with several green leaves and a few flowers."
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
      animationDescription: "The plant grows very slowly with minimal sunlight, water, and soil nutrition. It develops a thin stem with few small leaves and no flowers."
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
      animationDescription: "With abundant sunlight but only moderate water and soil nutrition, the plant grows fairly well. It develops a sturdy stem with vibrant green leaves, and some flowers begin to bloom."
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
      animationDescription: "With moderate sunlight, plentiful water, and average soil nutrition, the plant grows steadily. The leaves appear lush due to high water content, and the plant produces several buds."
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
      animationDescription: "With moderate sunlight and water but nutrient-rich soil, the plant develops a strong root system. The stem grows thick and sturdy with dark green leaves and several flowers."
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
      animationDescription: "Despite limited sunlight, the abundant water and rich soil allow the plant to grow moderately. The stem stretches upward seeking light, with fewer but larger leaves developing."
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
      animationDescription: "With strong sunlight and rich soil but minimal water, the plant shows signs of drought stress. The leaves appear slightly wilted, though some flowers still develop due to the nutrients."
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
      animationDescription: "With abundant sunlight and water but poor soil, the plant grows quickly but appears somewhat pale. The stem and leaves develop well, but fewer flowers bloom due to nutrient deficiency."
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
      animationDescription: "Clouds form gradually in the sky as moisture condenses at moderate temperatures. Light rain begins to fall with gentle wind gusts."
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

/**
 * Get the animation description for a given set of inputs
 */
export const getAnimationDescription = (
  simulationId: string,
  inputValues: Record<string, string | number>
): string | undefined => {
  // Get the simulation data set
  const dataSet = getSimulationDataSet(simulationId);
  
  if (!dataSet) {
    console.error(`No data set found for simulation ID: ${simulationId}`);
    return undefined;
  }
  
  // Filter out empty values
  const filteredInputValues: Record<string, string | number> = {};
  Object.entries(inputValues).forEach(([key, value]) => {
    if (value !== '') {
      filteredInputValues[key] = value;
    }
  });
  
  // If all inputs are empty, return undefined
  if (Object.keys(filteredInputValues).length === 0) {
    console.warn('All inputs are empty');
    return undefined;
  }
  
  // Find the mapping that matches the inputs
  const mapping = dataSet.mappings.find(mapping => {
    // Check if all non-empty input values match
    return Object.entries(filteredInputValues).every(([key, value]) => {
      return mapping.inputs[key] === value;
    });
  });
  
  // If no mapping is found, return default value
  if (!mapping) {
    console.warn(`No mapping found for inputs: ${JSON.stringify(filteredInputValues)}`);
    return "The simulation runs with the given parameters, showing the relationship between inputs and outputs.";
  }
  
  return mapping.animationDescription;
}; 