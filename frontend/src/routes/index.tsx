import React, { FunctionComponent } from 'react';

import PageWrapper from '../components/PageWrapper';
import SearchBox from '../components/SearchBox';

const Home: FunctionComponent = () => {
  return (
    <React.Fragment>
      <PageWrapper>
        <SearchBox to={'/categories/search'}/>
      </PageWrapper>
    </React.Fragment>
  )
}

export default Home;