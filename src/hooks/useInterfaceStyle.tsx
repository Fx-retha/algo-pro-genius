import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type InterfaceStyle =
  | 'default'
  | 'circle'
  | 'square'
  | 'pill'
  | 'soft'
  | 'bubble'
  | 'sleek'
  | 'cut';

interface InterfaceStyleContextType {
  style: InterfaceStyle;
  setStyle: (style: InterfaceStyle) => void;
  radiusClass: string;
}

const styleToRadius: Record<InterfaceStyle, string> = {
  default: 'rounded-xl',
  circle: 'rounded-full',
  square: 'rounded-none',
  pill: 'rounded-3xl',
  soft: 'rounded-md',
  bubble: 'rounded-[2rem]',
  sleek: 'rounded-lg',
  cut: 'rounded-tl-xl rounded-br-xl',
};

const radiusMap: Record<InterfaceStyle, string> = {
  default: '0.75rem',
  circle: '9999px',
  square: '0px',
  pill: '1.5rem',
  soft: '0.375rem',
  bubble: '2rem',
  sleek: '0.5rem',
  cut: '0.75rem',
};

const InterfaceStyleContext = createContext<InterfaceStyleContextType>({
  style: 'default',
  setStyle: () => {},
  radiusClass: 'rounded-xl',
});

export function InterfaceStyleProvider({ children }: { children: ReactNode }) {
  const [style, setStyleState] = useState<InterfaceStyle>(() => {
    return (localStorage.getItem('interface-style') as InterfaceStyle) || 'default';
  });

  const setStyle = (s: InterfaceStyle) => {
    setStyleState(s);
    localStorage.setItem('interface-style', s);
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--radius', radiusMap[style]);
  }, [style]);

  return (
    <InterfaceStyleContext.Provider value={{ style, setStyle, radiusClass: styleToRadius[style] }}>
      {children}
    </InterfaceStyleContext.Provider>
  );
}

export function useInterfaceStyle() {
  return useContext(InterfaceStyleContext);
}
