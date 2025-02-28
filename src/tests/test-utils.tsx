import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

import { CharactersProvider } from '@/context/CharactersContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { UIProvider } from '@/context/UIContext';
import { Character } from '@/services/api';

interface ProvidersProps {
  children: React.ReactNode;
  initialCharactersMap?: { [key: number]: Character };
}

function Providers({ children, initialCharactersMap = {} }: ProvidersProps) {
  return (
    <UIProvider>
      <FavoritesProvider>
        <CharactersProvider initialCharactersMap={initialCharactersMap}>
          {children}
        </CharactersProvider>
      </FavoritesProvider>
    </UIProvider>
  );
}

interface ExtendedRenderOptions extends RenderOptions {
  initialCharactersMap?: { [key: number]: Character };
}

/**
 * renderWithProviders:
 *  - Envuelve el componente en CharactersProvider, FavoritesProvider y UIProvider.
 *  - Permite inyectar un initialCharactersMap para pre-cargar personajes en CharactersContext.
 */
export function renderWithProviders(
  ui: ReactElement,
  { initialCharactersMap, ...options }: ExtendedRenderOptions = {}
) {
  return render(ui, {
    wrapper: props => <Providers {...props} initialCharactersMap={initialCharactersMap} />,
    ...options,
  });
}
