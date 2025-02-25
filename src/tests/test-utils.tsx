import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { CharactersProvider } from "@/context/CharactersContext";
import { Character } from "@/services/api";

interface ProvidersProps {
  children: React.ReactNode;
  initialCharactersMap?: { [key: number]: Character };
}

function Providers({ children, initialCharactersMap = {} }: ProvidersProps) {
  return (
    <CharactersProvider initialCharactersMap={initialCharactersMap}>
      {children}
    </CharactersProvider>
  );
}

interface ExtendedRenderOptions extends RenderOptions {
  initialCharactersMap?: { [key: number]: Character };
}

export function renderWithProviders(
  ui: ReactElement,
  { initialCharactersMap, ...options }: ExtendedRenderOptions = {},
) {
  return render(ui, {
    wrapper: (props) => (
      <Providers {...props} initialCharactersMap={initialCharactersMap} />
    ),
    ...options,
  });
}
