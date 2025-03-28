// Define the structure of our theme
export interface Theme {
  name: string;
  colors: {
    // Base colors
    primary: string; // General primary color
    secondary: string;
    accent: string;
    
    // Primary color variations
    primaryBlue: {
      text: string;      // For text in primary color
      button: string;    // For button backgrounds
      border: string;    // For borders
      hover: string;     // For hover states
    };
    
    // Background colors
    background: {
      main: string;
      surface: string;
      input: string;
      tableHeader: string;
      tableBorder: string;
      highlighted: string;
      disabled: string;
      hover: string;
    };
    
    // Text colors
    text: {
      primary: string;
      secondary: string;
      onPrimary: string;
      error: string;
      disabled: string;
    };
    
    // Border colors
    border: {
      main: string;
      input: string;
      active: string;
      focus: string;
    };
    
    // Functional colors
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  
  // Additional theme settings
  borderRadius: string;
  fontSizes: {
    small: string;
    medium: string;
    large: string;
    xlarge: string;
  };
}

// Light theme
export const lightTheme: Theme = {
  name: 'light',
  colors: {
    primary: 'rgb(36, 120, 204)', // Blue primary color
    secondary: 'rgb(80, 155, 223)', // Lighter blue
    accent: 'rgb(161, 46, 207)', // Purple accent
    
    // Primary blue variations
    primaryBlue: {
      text: 'rgb(36, 120, 204)',      // Slightly deeper blue for text
      button: 'rgb(36, 120, 204)',     // Standard blue for button backgrounds
      border: 'rgb(36, 120, 204)',     // Same blue for borders
      hover: 'rgb(80, 155, 223)',      // Lighter blue for hover states
    },
    
    background: {
      main: '#ffffff',
      surface: '#F5F5F5',
      input: '#ffffff',
      tableHeader: '#E6F1FF',
      tableBorder: 'rgb(105, 105, 105)',
      highlighted: 'rgba(188, 41, 246, 0.17)', // Light purple
      disabled: '#E4E4E4',
      hover: '#D6EBFF', // Light blue hover
    },
    
    text: {
      primary: '#333333',
      secondary: '#666666',
      onPrimary: '#ffffff',
      error: '#ff4d4f',
      disabled: '#909090',
    },
    
    border: {
      main: '#909090',
      input: '#696969',
      active: 'rgb(36, 120, 204)', // Same as primary
      focus: '#000000',
    },
    
    error: '#ff4d4f',
    warning: '#faad14',
    success: '#52c41a',
    info: '#1890ff',
  },
  
  borderRadius: '6px',
  fontSizes: {
    small: '0.9rem',
    medium: '1rem',
    large: '1.25rem',
    xlarge: '1.5rem',
  },
};

// Dark theme
export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    primary: 'rgb(64, 169, 255)', // Brighter blue for dark theme
    secondary: 'rgb(120, 191, 255)', // Lighter blue
    accent: 'rgb(221, 144, 255)', // Brighter purple for dark theme
    
    // Primary blue variations for dark theme
    primaryBlue: {
      text: 'rgb(124, 184, 236)',      // Brighter blue for text in dark mode
      button: 'rgb(4, 59, 128)',     // Standard blue for button backgrounds
      border: 'rgb(36, 120, 204)',     // Slightly darker border
      hover: 'rgb(17, 89, 167)',     // Lighter blue for hover states
    },
    
    background: {
      main: '#121212',
      surface: '#1f1f1f',
      input: '#000',
      tableHeader: 'rgb(4, 59, 128)',
      tableBorder: 'rgb(144, 144, 144)',
      highlighted: 'rgba(180, 54, 239, 0.24)', // Dark purple
      disabled: '#3C3C3C',
      hover: 'rgba(64, 169, 255, 0.1)', // Subtle blue hover
    },
    
    text: {
      primary: '#e1e1e1',
      secondary: '#a0a0a0',
      onPrimary: '#ffffff',
      error: '#ff7875',
      disabled: '#696969',
    },
    
    border: {
      main: 'rgb(144, 144, 144)',
      input: '#d8d8d8',
      active: 'rgb(64, 169, 255)', // Same as primary
      focus: '#ffffff',
    },
    
    error: '#ff7875',
    warning: '#ffc53d',
    success: '#73d13d',
    info: '#40a9ff',
  },
  
  borderRadius: '6px',
  fontSizes: {
    small: '0.9rem',
    medium: '1rem',
    large: '1.25rem',
    xlarge: '1.5rem',
  },
};

// Default theme
export const defaultTheme = lightTheme; 