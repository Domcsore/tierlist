import React, { ChangeEventHandler, FunctionComponent, MouseEventHandler } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

import searchIcon from '../assets/searchIcon.svg';

import TextInput from './TextInput';

import { colours, spacing, fontSizes, radius, buildRadius } from '../assets/styles';
import { useCategorySearch} from '../hooks/apiHooks';

const searchBoxOptions = {
  borderSize: '2px',
}

const SearchBoxContainer = styled.div`
  position: relative;
  display: inline-flex;
`;

const SearchResultsContainer = styled.div`
  position: absolute;
  background: white;
  color: ${colours.darkBlue};
  left: 0;
  right: 0;
  top: 100%;
  border-radius: ${buildRadius(0, 0, 1, 1, radius.md)};
`;

const SearchResultRow = styled.div`
  padding: calc(${spacing.xs} + ${searchBoxOptions.borderSize});
  border-bottom: 1px solid ${colours.darkBlue};
  font-size: ${fontSizes.sm};
  &:last-child {
    border-bottom: none;
  }
`;

const SearchButton = styled.button<{hasResults: boolean}>`
  border-radius: ${props => props.hasResults ? buildRadius(0,1,0,0, radius.md) : buildRadius(0,1,1,0, radius.md)};
  border: none;
  padding-left: ${spacing.sm};
  padding-right: ${spacing.sm};
  cursor: pointer;
  background: transparent;
  border: ${searchBoxOptions.borderSize} solid white;
  border-left: none;
  color: white;
`;

const SearchTextInput = styled(TextInput)<{hasResults: boolean}>`
  border-radius: ${props => props.hasResults ? buildRadius(1,0,0,0, radius.md) : buildRadius(1,0,0,1, radius.md)};
  border-right: none;
`;

const SearchIcon = styled.img`
  height: ${fontSizes.md};
`;

const SearchBox: FunctionComponent<{placeholder?: string, to: string}> = ({placeholder, to}) => {
  const [searchInput, setSearchInput] = React.useState('');
  const [data] = useCategorySearch(searchInput);
  const navigate = useNavigate();

  const handleKeyUp: ChangeEventHandler<HTMLInputElement> = (event) => {
    setSearchInput(event.target.value);
  }

  const handleButtonClick: MouseEventHandler = (event) => {
    event.preventDefault();
    navigate(`${to}/${searchInput}`);
  }

  return (
    <SearchBoxContainer>
      <SearchTextInput placeholder={placeholder || 'Search'} onChange={handleKeyUp} value={searchInput} hasResults={data && data.length > 0} />
      <SearchButton onClick={handleButtonClick} hasResults={data && data.length > 0}>
        <SearchIcon src={searchIcon} alt='Magnifying glass icon' />
      </SearchButton>
      <SearchResults results={data || []} />
    </SearchBoxContainer>
  )
}

const SearchResults: FunctionComponent<{results: any[]}> = ({results}) => {
  const resultRows = results.map(result => (<SearchResultRow key={result.id}>{result.name}</SearchResultRow>))

  return (
    <SearchResultsContainer>
      {resultRows}
    </SearchResultsContainer>
  )
}

export default SearchBox;