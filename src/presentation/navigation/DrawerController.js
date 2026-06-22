import { createContext, useContext } from 'react';

const DrawerControllerContext = createContext({
  openDrawer: () => {},
  closeDrawer: () => {},
});

export function DrawerControllerProvider({ value, children }) {
  return (
    <DrawerControllerContext.Provider value={value}>
      {children}
    </DrawerControllerContext.Provider>
  );
}

export function useDrawerController() {
  return useContext(DrawerControllerContext);
}
