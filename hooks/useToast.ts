import { useState, useCallback } from 'react';
import { ToastType } from '../components/Toast';

export interface ToastState {
  message: string;
  type: ToastType;
  id: string;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const show = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const success = useCallback((message: string) => show(message, 'success'), [show]);
  const error = useCallback((message: string) => show(message, 'error'), [show]);
  const info = useCallback((message: string) => show(message, 'info'), [show]);

  return { toasts, show, success, error, info };
};
