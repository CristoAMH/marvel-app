import { useState } from 'react';

interface ErrorState {
  hasError: boolean;
  message: string;
}

export function useErrorHandler() {
  const [error, setError] = useState<ErrorState>({ hasError: false, message: '' });

  const handleError = (err: unknown) => {
    let message = 'An unexpected error occurred';

    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'string') {
      message = err;
    }

    setError({ hasError: true, message });
  };

  const clearError = () => {
    setError({ hasError: false, message: '' });
  };

  return { error, handleError, clearError };
}
