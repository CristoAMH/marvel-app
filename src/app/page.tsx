import { Suspense } from 'react';
import { fetchCharacters } from '@/services/api';
import HomeClient from '@/features/home/HomeClient';
import { LoadingOverlay } from '@/components/LoadingOverlay';

// Server Component que hace el fetch de datos inicial
export default async function HomePage() {
  // Fetch de datos en el servidor
  const initialCharacters = await fetchCharacters();

  return (
    <Suspense fallback={<LoadingOverlay message="Loading characters..." />}>
      <HomeClient initialCharacters={initialCharacters} />
    </Suspense>
  );
}
