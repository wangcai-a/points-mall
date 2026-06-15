import { createContext, useContext, useState, ReactNode } from 'react';
import { Student, Notification } from '@/types';

interface AppContextType {
  currentStudent: Student | null;
  setCurrentStudent: (student: Student | null) => void;
  notification: Notification | null;
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const id = Date.now().toString();
    setNotification({ id, message, type, duration: 3000 });
    setTimeout(() => {
      setNotification(prev => prev?.id === id ? null : prev);
    }, 3000);
  };

  return (
    <AppContext.Provider value={{ currentStudent, setCurrentStudent, notification, showNotification }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
