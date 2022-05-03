import styled from 'styled-components';
import { spacing, radius } from '../assets/styles';

const TextInput = styled.input`
  background-color: transparent;
  border: white 2px solid;
  border-radius: ${radius.md};
  color: white;
  padding: ${spacing.xs};
  font: inherit;
  outline: none;
  &::placeholder {
    color: white;
  }
`;

export default TextInput;