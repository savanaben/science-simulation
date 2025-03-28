import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { ThemeProvider as StyledThemeProvider, createGlobalStyle } from 'styled-components';
import { lightTheme, darkTheme, Theme } from './theme';

// Global styles to apply theme to HTML elements
const GlobalStyle = createGlobalStyle`
  html, body {
    background-color: ${props => props.theme.colors.background.main};
    transition: background-color 0.3s ease;
  }
`;

// Define the theme context type
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  toggleTheme: () => {},
  setTheme: () => {},
});

// Define props for the ThemeProvider component
interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: 'light' | 'dark';
}

// Theme Provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children,
  initialTheme = 'light',
}) => {
  // Use state to store the current theme
  const [theme, setThemeState] = useState<Theme>(
    initialTheme === 'dark' ? darkTheme : lightTheme
  );

  // Effect to check for saved theme preference in localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setThemeState(darkTheme);
    } else if (savedTheme === 'light') {
      setThemeState(lightTheme);
    }
  }, []);

  // Function to toggle between light and dark themes
  const toggleTheme = useCallback(() => {
    setThemeState(prevTheme => {
      const newTheme = prevTheme.name === 'light' ? darkTheme : lightTheme;
      localStorage.setItem('theme', newTheme.name);
      return newTheme;
    });
  }, []);

  // Function to set a specific theme
  const setTheme = useCallback((themeName: 'light' | 'dark') => {
    setThemeState(themeName === 'dark' ? darkTheme : lightTheme);
    localStorage.setItem('theme', themeName);
  }, []);

  // Create the context value
  const contextValue: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  // Provide the theme to styled-components and to our custom context
  return (
    <ThemeContext.Provider value={contextValue}>
      <StyledThemeProvider theme={theme}>
        <GlobalStyle />
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext); 