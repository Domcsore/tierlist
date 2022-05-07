import React, { ChangeEventHandler, FunctionComponent, useState } from 'react';
import styled from 'styled-components';
import PageWrapper from '../components/PageWrapper';
import TextInput from '../components/TextInput';

const CategoryNameTextInput = styled(TextInput)`
  width: 100%;
`;

const CreateCategory: FunctionComponent = () => {
  const [categoryName, setCategoryName] = useState('');

  const handleCategoryNameChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setCategoryName(event.target.value);
  }

  return (
    <PageWrapper>
      <CategoryNameTextInput placeholder='Category name' value={categoryName} onChange={handleCategoryNameChange} />
    </PageWrapper>
  )
}

export default CreateCategory;