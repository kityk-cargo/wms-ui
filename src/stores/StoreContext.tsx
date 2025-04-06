import React, { createContext, useContext, ReactNode } from 'react';
import { RootStore, rootStore } from './RootStore';

// Create the store context
const StoreContext = createContext<RootStore | undefined>(undefined);

// Store provider props
interface StoreProviderProps {
  children: ReactNode;
}

/**
 * Store provider component to make the stores available via context
 */
export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  return (
    <StoreContext.Provider value={rootStore}>
      {children}
    </StoreContext.Provider>
  );
};

/**
 * Custom hook to use the store context
 */
export const useStore = (): RootStore => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

/**
 * Custom hook to use the theme store
 */
export const useThemeStore = () => {
  const { themeStore } = useStore();
  return themeStore;
};

/**
 * Custom hook to use the order store
 */
export const useOrderStore = () => {
  const { orderStore } = useStore();
  return orderStore;
};

/**
 * Custom hook to use the product store
 */
export const useProductStore = () => {
  const { productStore } = useStore();
  return productStore;
}; 