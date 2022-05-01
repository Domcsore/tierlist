import React, { FunctionComponent } from 'react';

import Header from './Header';

const PageWrapper: FunctionComponent<{children: any}> = ({children}) => {
  return (
    <React.Fragment>
      <Header />
      <main>
        {children}
      </main>
    </React.Fragment>
  )
}

export default PageWrapper;