export const spacing = {
  xs: '0.5rem',
  sm: '1rem',
  md: '2rem',
  lg: '3rem'
};

export const colours = {
  darkBlue: '#0b1728'
}

export const fontSizes = {
  sm: '0.8rem',
  md: '1rem',
  lg: '1.8rem',
  xl: '2rem',
  xxl: '2.8rem',
}

export const radius = {
  md: '10px'
}

type radiusCorner = 1 | 0 | true | false;

export const buildRadius = (
  topLeft: radiusCorner, 
  topRight: radiusCorner, 
  bottomRight: radiusCorner, 
  bottomLeft: radiusCorner, 
  radius: string): string => {
  const getValue = (corner: radiusCorner): string => (corner && radius) || '0';

  return `${getValue(topLeft)} ${getValue(topRight)} ${getValue(bottomRight)} ${getValue(bottomLeft)}`;
}