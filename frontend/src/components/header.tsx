import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

import { spacing } from '../assets/styles';

import logoSvg from '../assets/logo.svg';

const SHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${spacing.sm};
`;

const LogoText = styled.h1`
  font-family: 'Vampiro One', cursive;
  margin-left: ${spacing.sm};
`;

const Logo = styled.img`
  height: 2rem;
`;

const Header: FunctionComponent = () => {
  return (
    <SHeader>
      <Logo src={logoSvg} alt='Tierist logo' />
      <LogoText>Tierist</LogoText>
    </SHeader>
  )
}

export default Header;