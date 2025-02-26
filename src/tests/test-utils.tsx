import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { CharactersProvider } from '@/context/CharactersContext';

interface ProvidersProps {
  children: React.ReactNode;
}

function Providers({ children }: ProvidersProps) {
  return <CharactersProvider>{children}</CharactersProvider>;
}

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: Providers, ...options });
}
