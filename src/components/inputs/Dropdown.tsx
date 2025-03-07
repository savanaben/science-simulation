import React from 'react';
import styled from 'styled-components';

// Define the props for the Dropdown component
interface DropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
}

// Styled components for the Dropdown
const DropdownContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: white;
  font-size: 1rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;

/**
 * Dropdown component for selecting from a list of options
 */
const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  value,
  onChange,
  id,
  className,
}) => {
  // Generate a unique ID if none is provided
  const uniqueId = id || `dropdown-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  // Handle the change event
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };
  
  return (
    <DropdownContainer className={className}>
      <Label htmlFor={uniqueId}>{label}</Label>
      <Select
        id={uniqueId}
        value={value}
        onChange={handleChange}
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </DropdownContainer>
  );
};

export default Dropdown; 