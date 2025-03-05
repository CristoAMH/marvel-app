// src/hooks/useErrorHandler.ts
import { useState } from 'react';

interface ErrorState {
  hasError: boolean;
  message: string;
}

export function useErrorHandler() {
  const [error, setError] = useState<ErrorState>({ hasError: false, message: '' });

  const handleError = (err: unknown) => {
    console.error('Error caught:', err);
    let message = 'An unexpected error occurred';

    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'string') {
      message = err;
    }

    setError({ hasError: true, message });

    // Aquí podrías integrar con un servicio de monitoreo como Sentry
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(err);
    // }
  };

  const clearError = () => {
    setError({ hasError: false, message: '' });
  };

  return { error, handleError, clearError };
}
