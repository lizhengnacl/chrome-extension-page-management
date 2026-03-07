import { NextUIProvider } from '@nextui-org/react';

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <NextUIProvider>
      {children}
    </NextUIProvider>
  );
}
