import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type InterfaceStyle = 'default' | 'circle' | 'square' | 'pill';

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

  // Apply CSS variable for radius globally
  useEffect(() => {
    const root = document.documentElement;
    const radiusMap: Record<InterfaceStyle, string> = {
      default: '0.75rem',
      circle: '9999px',
      square: '0px',
      pill: '1.5rem',
    };
    root.style.setProperty('--radius', radiusMap[style]);
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
