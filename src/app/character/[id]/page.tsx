import Link from 'next/link';

export default async function CharacterPage() {
  return (
    <div>
      <header>
        <Link href="/">← Volver al listado</Link>
        <h1>'character name'</h1>
      </header>
    </div>
  );
}
