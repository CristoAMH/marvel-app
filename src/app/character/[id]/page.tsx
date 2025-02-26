'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Character, fetchCharacters } from '@/services/api';
import { useCharacters } from '@/context/CharactersContext';

export default function CharacterPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };
  const { charactersMap, setCharacter } = useCharacters();

  const [character, setLocalCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Ver si ya existe en el contexto
    const existing = charactersMap[+id]; // +id para convertir string a number
    if (existing) {
      setLocalCharacter(existing);
      setLoading(false);
    } else {
      // 2. No existe en el contexto -> pedimos la lista de 50
      fetchCharacters()
        .then(list => {
          // Buscar el personaje en la lista
          const found = list.find(char => char.id === +id);
          if (!found) {
            // Si no está, redirige o muestra un error
            router.push('/404');
            return;
          }
          // Si lo encontramos, lo guardamos en el contexto y en el estado local
          setCharacter(found);
          setLocalCharacter(found);
        })
        .catch(err => {
          console.error('Error fetching character detail:', err);
          router.push('/404');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, charactersMap, setCharacter, router]);

  if (loading) {
    return <div>Cargando personaje...</div>;
  }

  if (!character) {
    return <div>No se encontró el personaje.</div>;
  }

  // Ordenar y limitar los cómics (si existen)
  const comics = character.comics?.items
    ? [...character.comics.items].sort((a, b) => a.name.localeCompare(b.name)).slice(0, 20)
    : [];

  return (
    <div style={{ padding: '1rem' }}>
      <header>
        {/* Logo que redirige a la Home */}
        <Link href="/">
          <Image src="/marvel-logo.png" alt="Marvel Logo" width={100} height={50} />
        </Link>
      </header>

      <section>
        <div>
          <Image
            src={`${character.thumbnail.path}.${character.thumbnail.extension}`}
            alt={character.name}
            width={300}
            height={300}
          />
        </div>
        <h1>{character.name}</h1>
        <p>{character.description || 'Sin descripción disponible'}</p>
      </section>

      <section>
        <h2>Cómics</h2>
        <ul>
          {comics.map((comic, index) => (
            <li key={index}>
              <p>{comic.name}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
