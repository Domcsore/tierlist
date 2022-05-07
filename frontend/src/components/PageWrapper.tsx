import React, { FunctionComponent, PropsWithChildren } from 'react';
import styled from 'styled-components';
import { spacing } from '../assets/styles';

import Header from './Header';

const Main = styled.main`
  padding: 0 ${spacing.lg} 0 ${spacing.lg};
`;

const PageWrapper: FunctionComponent<PropsWithChildren<{}>> = ({children}) => {
  return (
    <React.Fragment>
      <Header />
      <Main>
        {children}
      </Main>
    </React.Fragment>
  )
}

export default PageWrapper;