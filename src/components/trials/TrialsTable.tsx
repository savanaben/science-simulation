import React, { useState, useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { SimulationConfig } from '../../config/simulationConfig';

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
  margin-top: 2rem;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #ddd;
`;

const TableHead = styled.thead`
  background-color: #f2f2f2;
`;

interface AnimatedRowProps {
  translateY: string;
  isAnimating: boolean;
  animationDuration: number;
}

const TableRow = styled.tr<AnimatedRowProps>`
  position: relative;
  
  &:hover {
    background-color: #f0f0f0;
  }
  
  /* Only apply transition when animating */
  ${props => props.isAnimating && css`
    transition: transform ${props.animationDuration}ms ease-out;
  `}
  
  /* Positioning */
  transform: translateY(${props => props.translateY});
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
  padding: 0.75rem;
  text-align: left;
  border-bottom: 2px solid #ddd;
`;

const TableCell = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #ddd;
  transition: all 300ms ease-out;
`;

const EmptyCell = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #ddd;
  color: #ccc;
  font-style: italic;
`;

const DeleteButton = styled.button`
  background-color: transparent;
  color: #4a90e2; /* Blue color */
  border: none;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(74, 144, 226, 0.1); /* Light blue background on hover */
  }
  
  /* Image styling */
  img {
    width: 18px;
    height: 18px;
  }
`;

const SectionTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #333;
`;

interface AnimatedTableWrapperProps {
  isAnimating: boolean;
  animationDuration: number;
}

// Add a wrapper for the table that will animate its height
const TableWrapper = styled.div<AnimatedTableWrapperProps>`
  /* Set initial height to auto to accommodate all content */
  height: auto;
  
  /* Apply height transition when animating */
  ${props => props.isAnimating && css`
    transition: height ${props.animationDuration}ms ease-out;
  `}
`;

// Add a container for the table to help with animation
const AnimatedTableContainer = styled.div`
  position: relative;
  overflow: hidden;
`;

/**
 * TrialsTable component that displays the results of simulation trials
 * dynamically based on the simulation configuration
 */
const TrialsTable: React.FC<TrialsTableProps> = ({
  simulationConfig,
  trials,
  onDeleteTrial,
  className,
}) => {
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
      // Force a reflow to ensure the height is applied before transitioning
      void tableWrapperRef.current.offsetHeight;
      
      // Set the new height (current height minus the row height)
      setTimeout(() => {
        if (tableWrapperRef.current) {
          tableWrapperRef.current.style.height = `${currentHeight - rowHeightRef.current}px`;
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

  // Determine if we should show the empty row
  const shouldShowEmptyRow = trials.length < simulationConfig.maxTrials;

  // Always render the table with headers, even if there are no trials
  return (
    <TableContainer className={className}>
      <SectionTitle>Simulation Results</SectionTitle>
      <AnimatedTableContainer>
        <TableWrapper 
          ref={tableWrapperRef}
          isAnimating={isTableAnimating}
          animationDuration={animationDuration}
        >
          <Table>
            <TableHead>
              <TableRow 
                translateY="0"
                isAnimating={false}
                animationDuration={animationDuration}
              >
                <TableHeader>Trial #</TableHeader>
                
                {/* Dynamic input headers */}
                {simulationConfig.inputs.map(input => (
                  <TableHeader key={`input-${input.id}`}>{input.label}</TableHeader>
                ))}
                
                {/* Dynamic output headers */}
                {simulationConfig.outputs.map(output => (
                  <TableHeader key={`output-${output.id}`}>{output.label}</TableHeader>
                ))}
                
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <tbody>
              {trials.length === 0 ? (
                // If no trials, show an empty row
                <EmptyRow
                  translateY="0"
                  isAnimating={false}
                  animationDuration={animationDuration}
                >
                  <EmptyCell colSpan={totalColumns}>No data yet. Run a simulation to see results.</EmptyCell>
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
                      >
                        <TableCell>{trial.id}</TableCell>
                        
                        {/* Dynamic input values */}
                        {simulationConfig.inputs.map(input => (
                          <TableCell key={`input-${input.id}-${trial.id}`}>
                            {formatValue(trial.inputs[input.id] || 'N/A')}
                          </TableCell>
                        ))}
                        
                        {/* Dynamic output values */}
                        {simulationConfig.outputs.map(output => (
                          <TableCell key={`output-${output.id}-${trial.id}`}>
                            {formatValue(
                              trial.outputs[output.id] !== undefined ? trial.outputs[output.id] : 'N/A',
                              output.unit
                            )}
                          </TableCell>
                        ))}
                        
                        <TableCell>
                          <DeleteButton 
                            onClick={() => handleDeleteTrial(trial.id)}
                            title="Delete trial"
                            aria-label="Delete trial"
                          >
                            <img src="/img/trash.svg" alt="Delete" />
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
                      <EmptyCell colSpan={totalColumns}>Run another simulation to add data</EmptyCell>
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
};

export default TrialsTable; 