import { useState, useEffect, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  title?: string;
  description: string;
  type: ToastType;
  duration?: number;
}

let toastCount = 0;
let observers: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

const notify = () => {
  observers.forEach((observer) => observer([...toasts]));
};

export const toast = {
  success: (description: string, options?: Partial<Toast>) => 
    addToast({ ...options, description, type: 'success' }),
  error: (description: string, options?: Partial<Toast>) => 
    addToast({ ...options, description, type: 'error' }),
  warning: (description: string, options?: Partial<Toast>) => 
    addToast({ ...options, description, type: 'warning' }),
  info: (description: string, options?: Partial<Toast>) => 
    addToast({ ...options, description, type: 'info' }),
  dismiss: (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  },
};

function addToast(toast: Omit<Toast, 'id'>) {
  const id = `toast-${toastCount++}`;
  const newToast = { ...toast, id, duration: toast.duration || 5000 };
  toasts = [...toasts, newToast];
  notify();

  if (newToast.duration !== Infinity) {
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
      notify();
    }, newToast.duration);
  }

  return id;
}

export function useToast() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>(toasts);

  useEffect(() => {
    const observer = (newToasts: Toast[]) => {
      setCurrentToasts(newToasts);
    };
    observers.push(observer);
    return () => {
      observers = observers.filter((obs) => obs !== observer);
    };
  }, []);

  return { toasts: currentToasts, toast };
}
