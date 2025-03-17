import React from 'react';
import styled from 'styled-components';

// Define the props for the Dropdown component
interface DropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
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
  margin-bottom: 0.3rem;
  font-size: 22px;
  text-align: left;
`;

const Select = styled.select`
  padding: .14rem 30px .1rem .3rem;
  border-radius: 4px;
  border: 1px solid #595959;
  background-color: white;
  font-size: 22px;
  font-family: 'Calibri', sans-serif;
  cursor: pointer;
  appearance: none; /* Remove default arrow */
  
  /* Custom dropdown arrow (caret) */
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='6' viewBox='0 0 12 6'><path d='M0 0 L6 6 L12 0 Z' fill='%23595959'/></svg>");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 12px 6px;
  

  
  &:disabled {
    background-color: #f5f5f5;
    border: 1px solid rgb(157, 157, 157);
    cursor: not-allowed;
    opacity: 0.7;
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
  disabled,
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
        disabled={disabled}
      >
        <option value=""></option>
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