import { useState, useEffect, useRef, forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { SimulationConfig } from '../../config/simulationConfig';
import { useTheme } from '../../theme/ThemeContext';

// Define the structure of a trial
export interface Trial {
  id: number;
  timestamp: Date;
  inputs: Record<string, string | number>;
  outputs: Record<string, number>;
}

// Define the props for the TrialsTable component
interface TrialsTableProps {
  simulationConfig: SimulationConfig;
  trials: Trial[];
  onDeleteTrial: (id: number) => void;
  className?: string;
}

// Styled components for the TrialsTable
const TableContainer = styled.div`
  
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid ${props => props.theme.colors.background.tableBorder};
  position: relative; /* Required for proper positioning of sticky elements */
`;

const TableHead = styled.thead`
  background-color: ${props => props.theme.colors.background.tableHeader};
`;

interface AnimatedRowProps {
  translateY: string;
  isAnimating: boolean;
  animationDuration: number;
  isHighlighted?: boolean;
}

const TableRow = styled.tr<AnimatedRowProps>`
  position: relative;
  
  /* Only apply transition and transform when actually animating with a non-zero value */
  ${props => props.isAnimating && props.translateY !== '0' && css`
    transition: transform ${props.animationDuration}ms ease-out;
    transform: translateY(${props.translateY});
  `}
  
  /* Highlight effect for new rows */
  ${props => props.isHighlighted && css`
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      box-shadow: inset 0 0 0 3px ${props => props.theme.colors.accent}; /* Theme accent color for outline */
      background-color: ${props => props.theme.colors.background.highlighted}; /* Theme highlighted background */
      pointer-events: none;
      animation: pulseHighlight 1s ease-out forwards;
      z-index: 1;
    }
    
    @keyframes pulseHighlight {
      0% {
        opacity: 1;
      }
      70% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }
  `}
`;

// Placeholder row that maintains the space of a deleted row
const PlaceholderRow = styled.tr<{ height: string }>`
  height: ${props => props.height};
  visibility: hidden;
  border: none;
  
  td {
    padding: 0;
    border: none;
  }
`;

// Empty row styling - now using the same AnimatedRowProps as TableRow
const EmptyRow = styled(TableRow)`
  height: 53px; // Same as regular rows
`;

const TableHeader = styled.th`
  padding: 0.4rem;
  text-align: center;
  border-bottom: 2px solid ${props => props.theme.colors.background.tableBorder};
  border-right: 1px solid ${props => props.theme.colors.background.tableBorder};
  font-size: 22px;
  
  &:last-child {
    border-right: none;
  }
`;

const TableCell = styled.td`
  padding: 0.4rem;
  text-align: center;
  border-bottom: 1px solid ${props => props.theme.colors.background.tableBorder};
  border-right: 1px solid ${props => props.theme.colors.background.tableBorder};
  transition: all 300ms ease-out;
  background-color: ${props => props.theme.colors.background.main};
  font-size: 22px;
  position: relative;
  z-index: 0;
  
  /* Remove bottom border for cells in the last row */
  tr:last-child & {
    border-bottom: none;
  }
  
  &:last-child {
    border-right: none;
  }
`;

// Add a TrashIcon component that inherits color
const TrashIcon = () => (
  <svg width="21" height="22" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M5.9375 2.11111C5.9375 0.883588 6.98055 0 8.125 0H12.875C14.0195 0 15.0625 0.883588 15.0625 2.11111V4.44444H18.8016C18.8081 4.44438 18.8147 4.44438 18.8212 4.44444H20C20.5523 4.44444 21 4.89216 21 5.44444C21 5.99673 20.5523 6.44444 20 6.44444H19.7391L18.7797 19.0122C18.6469 20.7509 17.1258 22 15.4136 22H5.58641C3.87419 22 2.35308 20.7509 2.22035 19.0122L1.26093 6.44444H1C0.447715 6.44444 0 5.99673 0 5.44444C0 4.89216 0.447715 4.44444 1 4.44444H2.17876C2.18531 4.44438 2.19185 4.44438 2.19838 4.44444H5.9375V2.11111ZM3.26675 6.44444L4.21454 18.86C4.25936 19.4471 4.80659 20 5.58641 20H15.4136C16.1934 20 16.7406 19.4471 16.7855 18.86L17.7333 6.44444H3.26675ZM13.0625 4.44444H7.9375V2.11111C7.9375 2.1028 7.93927 2.08303 7.96854 2.05564C7.99896 2.02718 8.05188 2 8.125 2H12.875C12.9481 2 13.001 2.02718 13.0315 2.05564C13.0607 2.08303 13.0625 2.1028 13.0625 2.11111V4.44444ZM8.125 8.88889C8.67728 8.88889 9.125 9.3366 9.125 9.88889V16.5556C9.125 17.1078 8.67728 17.5556 8.125 17.5556C7.57272 17.5556 7.125 17.1078 7.125 16.5556V9.88889C7.125 9.3366 7.57272 8.88889 8.125 8.88889ZM12.875 8.88889C13.4273 8.88889 13.875 9.3366 13.875 9.88889V16.5556C13.875 17.1078 13.4273 17.5556 12.875 17.5556C12.3227 17.5556 11.875 17.1078 11.875 16.5556V9.88889C11.875 9.3366 12.3227 8.88889 12.875 8.88889Z" 
      fill="currentColor"
    />
  </svg>
);

const DeleteButton = styled.button`
  background-color: transparent;
  color: ${props => props.theme.colors.primaryBlue.text};
  border: 1px solid ${props => props.theme.colors.border.main};
  border-radius: ${props => props.theme.borderRadius};
  width: 32px;
  height: 35px;
  display: flex;
  padding: 0rem;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  
  &:hover {
    background-color: ${props => props.theme.colors.background.hover};
  }
  
  /* SVG will inherit the color from the button */
  svg {
  
  }
  
  /* Disabled state */
  &:disabled {
    background-color: ${props => props.theme.colors.background.disabled};
    cursor: not-allowed;
    opacity: 1; /* Keep full opacity */
    border: 1px solid ${props => props.theme.colors.background.main};
    color: ${props => props.theme.colors.text.disabled}; /* Use the disabled text color */
    
    &:hover {
      background-color: ${props => props.theme.colors.background.disabled};
    }
  }
`;

const SectionTitle = styled.h2`
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 24px;
  color: ${props => props.theme.colors.text.primary};
  text-align: center;
`;

interface AnimatedTableWrapperProps {
  isAnimating: boolean;
  animationDuration: number;
}

// Add a container for the table to help with animation
const AnimatedTableContainer = styled.div`
  position: relative;
  /* Prevent vertical scrollbar from appearing during animations */
  overflow-y: hidden;
`;

// Update TableWrapper to conditionally apply sticky styling
const TableWrapper = styled.div<AnimatedTableWrapperProps>`
  /* Set initial height to auto to accommodate all content */
  height: auto;
  overflow-x: auto;
  overflow-y: hidden; /* Prevent vertical scrollbars */
  
  /* Apply height transition when animating */
  ${props => props.isAnimating && css`
    transition: height ${props.animationDuration}ms ease-out;
  `}

  /* Style for table with sticky columns - only applied when .has-scroll class is present */
  &.has-scroll {
    /* Style for sticky columns (last column header and cells) */
    & th:last-child, 
    & td:last-child {
      position: sticky;
      right: 0;
      z-index: 3;
      /* Add box shadow for visual separation */
      box-shadow: 0 -1px 0 #696969, -5px 0 20px -2px rgba(0, 0, 0, 0.25);
    }
    
    /* Ensure the background colors are maintained for sticky elements */
    & th:last-child {
      background-color: ${props => props.theme.colors.background.tableHeader};
      border-bottom: 2px solid ${props => props.theme.colors.background.tableBorder};
    }
    
    & td:last-child {
      background-color: ${props => props.theme.colors.background.main};
      border-bottom: 1px solid ${props => props.theme.colors.background.tableBorder};
    }
    
    /* Remove bottom border for the last row's sticky cell */
    & tbody tr:last-child td:last-child {
      border-bottom: none;
    }
  }
`;

/**
 * TrialsTable component that displays the results of simulation trials
 * dynamically based on the simulation configuration
 */
const TrialsTable = forwardRef<HTMLDivElement, TrialsTableProps>(({
  simulationConfig,
  trials,
  onDeleteTrial,
  className,
}, ref) => {
  // State to track row positions
  const [rowPositions, setRowPositions] = useState<Record<number, string>>({});
  // State to track which rows are animating
  const [animatingRows, setAnimatingRows] = useState<Record<number, boolean>>({});
  // State to track the deleted row (to maintain its space during animation)
  const [deletedRowId, setDeletedRowId] = useState<number | null>(null);
  // State to track if the table is animating
  const [isTableAnimating, setIsTableAnimating] = useState(false);
  // State to track if the empty row should animate
  const [emptyRowAnimating, setEmptyRowAnimating] = useState(false);
  // State to track the empty row position
  const [emptyRowPosition, setEmptyRowPosition] = useState('0');
  // State to track the newly added row for highlighting
  const [highlightedRowId, setHighlightedRowId] = useState<number | null>(null);
  // Ref to track the previous trials length
  const prevTrialsLengthRef = useRef<number>(0);
  // Ref to store the height of a row for animation calculations
  const rowHeightRef = useRef<number>(0);
  // Ref to the table wrapper element
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  // Animation duration in milliseconds
  const animationDuration = 300;
  // Total columns in the table (inputs + outputs + trial # + actions)
  const totalColumns = simulationConfig.inputs.length + simulationConfig.outputs.length + 2;
  // Track if we're in the middle of an animation
  const animatingRef = useRef(false);

  // Get the current theme to monitor theme changes
  const { theme } = useTheme();

  // Format a value for display
  const formatValue = (value: string | number, unit?: string): string => {
    if (unit) {
      return `${value} ${unit}`;
    }
    return String(value);
  };

  // Handle row deletion with animation
  const handleDeleteTrial = (idToDelete: number) => {
    // Prevent multiple animations from running simultaneously
    if (animatingRef.current) return;
    animatingRef.current = true;
    
    // Find the index of the row to delete
    const indexToDelete = trials.findIndex(trial => trial.id === idToDelete);
    if (indexToDelete === -1) {
      animatingRef.current = false;
      return;
    }
    
    // Store current scroll state before making any changes
    const hasScroll = tableWrapperRef.current?.classList.contains('has-scroll');
    
    // Calculate row height if not already set
    if (!rowHeightRef.current) {
      const tableRows = document.querySelectorAll('tbody tr');
      if (tableRows.length > 0) {
        // Fix TypeScript error by casting to HTMLElement
        const firstRow = tableRows[0] as HTMLElement;
        rowHeightRef.current = firstRow.offsetHeight;
      } else {
        rowHeightRef.current = 53; // Fallback height
      }
    }
    
    // Set up row positions and animation states
    const newRowPositions: Record<number, string> = {};
    const newAnimatingRows: Record<number, boolean> = {};
    
    // Only rows below the deleted row need to move up
    trials.forEach((trial, index) => {
      if (index > indexToDelete) {
        newRowPositions[trial.id] = `-${rowHeightRef.current}px`;
        newAnimatingRows[trial.id] = true;
      } else {
        newRowPositions[trial.id] = '0';
        newAnimatingRows[trial.id] = false;
      }
    });
    
    // Also animate the empty row if it should be shown
    if (trials.length < simulationConfig.maxTrials) {
      setEmptyRowAnimating(true);
      setEmptyRowPosition(`-${rowHeightRef.current}px`);
    }
    
    // Capture the current table height before animation
    if (tableWrapperRef.current) {
      const currentHeight = tableWrapperRef.current.offsetHeight;
      tableWrapperRef.current.style.height = `${currentHeight}px`;
      
      // If it was sticky before, ensure it remains sticky during animation
      if (hasScroll) {
        tableWrapperRef.current.classList.add('has-scroll');
      }
      
      // Force a reflow to ensure the height is applied before transitioning
      void tableWrapperRef.current.offsetHeight;
      
      // Set the new height (current height minus the row height)
      setTimeout(() => {
        if (tableWrapperRef.current) {
          tableWrapperRef.current.style.height = `${currentHeight - rowHeightRef.current}px`;
          
          // Make sure the scroll class is maintained
          if (hasScroll) {
            tableWrapperRef.current.classList.add('has-scroll');
          }
        }
      }, 0);
    }
    
    // Set the deleted row ID to maintain its space
    setDeletedRowId(idToDelete);
    setRowPositions(newRowPositions);
    setAnimatingRows(newAnimatingRows);
    setIsTableAnimating(true);
    
    // Wait for animation to complete before actually removing the row
    setTimeout(() => {
      onDeleteTrial(idToDelete);
      // Reset the states
      setRowPositions({});
      setAnimatingRows({});
      setDeletedRowId(null);
      setEmptyRowAnimating(false);
      setEmptyRowPosition('0');
      
      // Keep table animation on for a bit longer to ensure smooth transition
      setTimeout(() => {
        setIsTableAnimating(false);
        // Reset the table wrapper height to auto
        if (tableWrapperRef.current) {
          tableWrapperRef.current.style.height = 'auto';
          
          // Recheck for horizontal scrolling after animation
          setTimeout(() => {
            if (tableWrapperRef.current) {
              // Reapply sticky column if necessary or if it was sticky before
              const needsScroll = tableWrapperRef.current.scrollWidth > tableWrapperRef.current.clientWidth;
              if (needsScroll || hasScroll) {
                tableWrapperRef.current.classList.add('has-scroll');
              } else {
                tableWrapperRef.current.classList.remove('has-scroll');
              }
            }
          }, 10); // Small delay to ensure DOM has updated
        }
        animatingRef.current = false;
      }, 50);
    }, animationDuration);
  };

  // Reset states when trials change
  useEffect(() => {
    if (!animatingRef.current) {
      setRowPositions({});
      setAnimatingRows({});
      setDeletedRowId(null);
      setIsTableAnimating(false);
      setEmptyRowAnimating(false);
      setEmptyRowPosition('0');
    }
  }, [trials.length]);

  // Effect to highlight newly added rows
  useEffect(() => {
    // Only highlight if a row was added (not deleted)
    if (trials.length > 0 && trials.length > prevTrialsLengthRef.current) {
      // Get the latest trial
      const latestTrial = trials[trials.length - 1];
      
      // Set the highlighted row ID
      setHighlightedRowId(latestTrial.id);
      
      // Clear the highlight after the animation duration
      const highlightTimer = setTimeout(() => {
        setHighlightedRowId(null);
      }, 1000); // Match the animation duration in the CSS
      
      // Clean up the timer
      return () => clearTimeout(highlightTimer);
    }
  }, [trials]);

  // Effect to update the previous trials length ref
  useEffect(() => {
    // Update the ref after the component renders with the new trials
    const timeoutId = setTimeout(() => {
      prevTrialsLengthRef.current = trials.length;
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [trials.length]);

  // Determine if we should show the empty row
  const shouldShowEmptyRow = trials.length < simulationConfig.maxTrials;

  // Check and update scroll status whenever trials change, window resizes, or theme changes
  useEffect(() => {
    const tableWrapper = tableWrapperRef.current;
    if (!tableWrapper) return;
    
    // Function to check if horizontal scrolling is needed
    const checkForScroll = () => {
      if (tableWrapper.scrollWidth > tableWrapper.clientWidth) {
        tableWrapper.classList.add('has-scroll');
      } else {
        tableWrapper.classList.remove('has-scroll');
      }
    };
    
    // Check initially
    checkForScroll();
    
    // Also check on window resize
    window.addEventListener('resize', checkForScroll);
    
    // Add a small delay for theme changes to complete re-rendering
    const themeChangeTimer = setTimeout(() => {
      checkForScroll();
    }, 50);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkForScroll);
      clearTimeout(themeChangeTimer);
    };
  }, [trials, simulationConfig, theme]); // Added theme dependency

  // Always render the table with headers, even if there are no trials
  return (
    <TableContainer className={className} ref={ref}>
      <SectionTitle id="data-table-title">Data Table</SectionTitle>
      <AnimatedTableContainer>
        <TableWrapper 
          ref={tableWrapperRef}
          isAnimating={isTableAnimating}
          animationDuration={animationDuration}
        >
          <Table aria-labelledby="data-table-title" role="grid">
            <TableHead>
              <TableRow 
                translateY="0"
                isAnimating={false}
                animationDuration={animationDuration}
                role="row"
              >
                <TableHeader role="columnheader" scope="col">Trial</TableHeader>
                
                {/* Dynamic input headers */}
                {simulationConfig.inputs.map(input => (
                  <TableHeader key={`input-${input.id}`} role="columnheader" scope="col">{input.label}</TableHeader>
                ))}
                
                {/* Dynamic output headers */}
                {simulationConfig.outputs.map(output => (
                  <TableHeader key={`output-${output.id}`} role="columnheader" scope="col">{output.label}</TableHeader>
                ))}
                
                <TableHeader role="columnheader" scope="col" aria-label="Actions"></TableHeader>
              </TableRow>
            </TableHead>
            <tbody>
              {trials.length === 0 ? (
                // If no trials, show an empty row
                <EmptyRow
                  translateY="0"
                  isAnimating={false}
                  animationDuration={animationDuration}
                  role="row"
                  aria-label="No trials have been run yet"
                >
                  <TableCell role="gridcell"></TableCell>
                  
                  {/* Empty cells for inputs */}
                  {simulationConfig.inputs.map(input => (
                    <TableCell key={`empty-input-${input.id}`} role="gridcell"></TableCell>
                  ))}
                  
                  {/* Empty cells for outputs */}
                  {simulationConfig.outputs.map(output => (
                    <TableCell key={`empty-output-${output.id}`} role="gridcell"></TableCell>
                  ))}
                  
                  <TableCell role="gridcell">
                    <DeleteButton 
                      disabled={true}
                      title="Delete trial"
                      aria-label="Delete trial button (disabled)"
                    >
                      <TrashIcon />
                    </DeleteButton>
                  </TableCell>
                </EmptyRow>
              ) : (
                // Otherwise, show the trials
                <>
                  {trials.map((trial) => {
                    // If this is the deleted row, render a placeholder instead
                    if (trial.id === deletedRowId) {
                      return (
                        <PlaceholderRow 
                          key={`placeholder-${trial.id}`} 
                          height={`${rowHeightRef.current}px`}
                        >
                          <td colSpan={totalColumns}></td>
                        </PlaceholderRow>
                      );
                    }
                    
                    // Otherwise render the normal row
                    return (
                      <TableRow 
                        key={trial.id} 
                        translateY={rowPositions[trial.id] || '0'}
                        isAnimating={animatingRows[trial.id] || false}
                        animationDuration={animationDuration}
                        data-trial-id={trial.id}
                        data-highlighted={trial.id === highlightedRowId}
                        isHighlighted={trial.id === highlightedRowId}
                        role="row"
                        aria-label={`Trial ${trial.id}`}
                      >
                        <TableCell role="gridcell">{trial.id}</TableCell>
                        
                        {/* Dynamic input values */}
                        {simulationConfig.inputs.map(input => (
                          <TableCell key={`input-${input.id}-${trial.id}`} role="gridcell">
                            {formatValue(trial.inputs[input.id] || 'N/A')}
                          </TableCell>
                        ))}
                        
                        {/* Dynamic output values */}
                        {simulationConfig.outputs.map(output => (
                          <TableCell key={`output-${output.id}-${trial.id}`} role="gridcell">
                            {formatValue(
                              trial.outputs[output.id] !== undefined ? trial.outputs[output.id] : 'N/A',
                              output.unit
                            )}
                          </TableCell>
                        ))}
                        
                        <TableCell role="gridcell">
                          <DeleteButton 
                            onClick={() => handleDeleteTrial(trial.id)}
                            title="Delete trial"
                            aria-label={`Delete trial ${trial.id}`}
                          >
                            <TrashIcon />
                          </DeleteButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {/* Add an empty row if we haven't reached the maximum number of trials */}
                  {shouldShowEmptyRow && (
                    <EmptyRow
                      translateY={emptyRowPosition}
                      isAnimating={emptyRowAnimating}
                      animationDuration={animationDuration}
                    >
                      <TableCell></TableCell>
                      
                      {/* Empty cells for inputs */}
                      {simulationConfig.inputs.map(input => (
                        <TableCell key={`empty-input-${input.id}`}></TableCell>
                      ))}
                      
                      {/* Empty cells for outputs */}
                      {simulationConfig.outputs.map(output => (
                        <TableCell key={`empty-output-${output.id}`}></TableCell>
                      ))}
                      
                      <TableCell>
                        <DeleteButton 
                          disabled={true}
                          title="Delete trial"
                          aria-label="Delete trial"
                        >
                          <TrashIcon />
                        </DeleteButton>
                      </TableCell>
                    </EmptyRow>
                  )}
                </>
              )}
            </tbody>
          </Table>
        </TableWrapper>
      </AnimatedTableContainer>
    </TableContainer>
  );
});

export default TrialsTable; 