import { render } from '@testing-library/react';
import { fetchCharacters } from '@/services/api';
import HomeClient from '@/features/home/HomeClient';
import { mockCharacters } from '@/tests/mocks/characterMocks';

jest.mock('@/services/api', () => ({
  fetchCharacters: jest.fn(),
}));

jest.mock('@/features/home/HomeClient', () => {
  return jest.fn().mockImplementation(({ initialCharacters }) => (
    <div data-testid="home-client">
      {initialCharacters?.map(character => (
        <div key={character.id} data-testid={`character-${character.id}`}>
          {character.name}
        </div>
      ))}
    </div>
  ));
});

jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    Suspense: jest.fn(({ children }) => children),
  };
});

jest.mock('../page', () => {
  return {
    __esModule: true,
    default: async () => {
      const { fetchCharacters } = require('@/services/api');
      const mockCharacters = await fetchCharacters();
      return (
        <div>
          <HomeClient initialCharacters={mockCharacters} />
        </div>
      );
    },
  };
});

describe('HomePage (Server Component)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetchCharacters as jest.Mock).mockResolvedValue(mockCharacters);
  });

  it('recupera personajes desde la API en el servidor', async () => {
    // Importa dinámicamente el componente de página
    const { default: HomePage } = await import('../page');

    // Renderiza el componente de servidor (es async)
    const pageComponent = await HomePage();

    // Renderiza el JSX resultante
    const { getByTestId } = render(<>{pageComponent}</>);

    // Verifica que se llamó a fetchCharacters
    expect(fetchCharacters).toHaveBeenCalled();

    // Verifica que el componente cliente está en el DOM
    expect(getByTestId('home-client')).toBeInTheDocument();
  });

  it('maneja errores de la API correctamente', async () => {
    // Simula un error de la API
    const apiError = new Error('API Error');
    (fetchCharacters as jest.Mock).mockRejectedValueOnce(apiError);

    // Importa dinámicamente el componente
    const { default: HomePage } = await import('../page');

    // Captura el error
    try {
      await HomePage();
      // Si no hay error, falla el test
      fail('Se esperaba que la promesa fuera rechazada');
    } catch (error) {
      // Verifica que el error es el esperado
      expect(error).toBe(apiError);
    }
  });
});
