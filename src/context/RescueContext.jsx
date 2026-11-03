import React, { createContext, useContext, useState } from 'react';
import SaveAnimalModal from '../components/SaveAnimalModal';

const RescueContext = createContext({
  openRescueModal: () => {},
  closeRescueModal: () => {},
  isRescueModalOpen: false,
});

export const RescueProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openRescueModal = () => setIsOpen(true);
  const closeRescueModal = () => setIsOpen(false);

  return (
    <RescueContext.Provider value={{ openRescueModal, closeRescueModal, isRescueModalOpen: isOpen }}>
      {children}
      <SaveAnimalModal isOpen={isOpen} onClose={closeRescueModal} />
    </RescueContext.Provider>
  );
};

export const useRescue = () => useContext(RescueContext);
