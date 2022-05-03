import React, { FunctionComponent, PropsWithChildren } from 'react';

import Header from './Header';

const PageWrapper: FunctionComponent<PropsWithChildren<{}>> = ({children}) => {
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