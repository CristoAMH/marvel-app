# **Marvel App**

## **Índice**

1. [Introducción](#introducción)
2. [Tecnologías y Librerías Principales](#tecnologías-y-librerías-principales)
3. [Arquitectura y Patrones de Diseño](#arquitectura-y-patrones-de-diseño)
   - [Contextos (Characters, Favorites, UI)](#contextos-characters-favorites-ui)
   - [Custom Hooks y Componentes Modulares](#custom-hooks-y-componentes-modulares)
   - [Por qué no Hexagonal o MVC](#por-qué-no-hexagonal-o-mvc)
4. [Estructura de Carpetas](#estructura-de-carpetas)
5. [Instalación y Ejecución](#instalación-y-ejecución)
6. [Testing](#testing)
7. [Decisiones de Diseño Destacadas](#decisiones-de-diseño-destacadas)
8. [Futuras Mejoras](#futuras-mejoras)

---

## **1. Introducción**

Esta aplicación es una **SPA** construida con **Next.js** 13 (App Router) y **React**, que consume la **API de Marvel** para listar personajes, buscarlos, ver detalles y añadirlos a **favoritos** (persistidos en `localStorage`). Además, se incluyen **tests** (unitarios e integrales) y **buenas prácticas** de accesibilidad y arquitectura.

¡Se puede hacer mucho mejor, pero gracias por la oportunidad, ha sido un ejercicio muy divertido!

URL de aplicación desplegada: https://marvel-app-red-five.vercel.app/

---

## **2. Tecnologías y Librerías Principales**

- **Next.js** 13 (App Router)
- **React** 18+
- **TypeScript**
- **Axios** para peticiones HTTP
- **Jest** + **React Testing Library** para testing
- **ESLint** + **Prettier** para linting y formateo
- **Custom Hooks** para la reutilización de lógica (useLocalStorage, useDebounce)
- **LocalStorage** para persistir favoritos con gestión optimizada
- **Context API** (tres contextos) para la gestión de estados globales
- **Componentes reutilizables** para mejor mantenibilidad y consistencia

---

## **3. Arquitectura y Patrones de Diseño**

La aplicación se basa en **contextos** para cada responsabilidad global (personajes, favoritos y estado de la UI). Además, se emplea **Next.js** (App Router) para la organización de rutas (Home y página de detalle).

### **Contextos (Characters, Favorites, UI)**

1. **CharactersContext**

   - Gestiona la lista/mapa de personajes.
   - Evita recargas innecesarias de la API si ya se dispone de los datos.

2. **FavoritesContext**

   - Maneja la lista de personajes favoritos (añadir/quitar).
   - Persiste la información en `localStorage` mediante custom hooks para mayor eficiencia.
   - Implementa manejo de eventos para sincronización entre pestañas.

3. **UIContext**
   - Controla el estado de la interfaz, por ejemplo `showFavorites` para filtrar la vista en la Home.
   - Permite, desde la CharacterPage, redirigir a la Home con `showFavorites = true`.

### **Custom Hooks y Componentes Modulares**

1. **Custom Hooks**

   - **useLocalStorage**: Encapsula la lógica de persistencia en localStorage con manejo de errores robusto.
   - **useDebounce**: Optimiza las búsquedas evitando solicitudes excesivas a la API.

2. **Componentes Modulares**
   - **Header**: Componente reutilizable para la navegación principal.
   - **CharacterCard**: Encapsula la presentación y lógica de tarjetas de personajes.
   - **SearchBar**: Componente de búsqueda optimizado y accesible.
   - **SkipLink**: Mejora la navegación por teclado para usuarios de tecnologías asistivas.

### **Por qué no Hexagonal o MVC**

- **Hexagonal** (o arquitectura limpia) es muy útil cuando se requiere una **separación de capas** más estricta (dominio, aplicación, infraestructura) y la app de frontend maneja múltiples fuentes de datos o reglas de negocio complejas.
- **MVC** se suele aplicar en frameworks server-side o en proyectos con un claro modelo-vista-controlador.
- **En este caso**, el frontend se apoya en **contextos** y una **capa de servicios** (API) sencilla. Esto **satisface** la complejidad actual sin añadir capas de abstracción que podrían resultar excesivas (sobrecarga). Si en el futuro la app crece en complejidad, se podría migrar a un enfoque más robusto.

---

## **4. Estructura de Carpetas**

Dentro de la carpeta `src`, la organización principal es la siguiente:

```
src
├── app
│   ├── /tests
│   ├── page.tsx               # HomePage
│   ├── page.module.css        # Estilos Home
│   └── character
│       └── [id]
│           ├── /tests
│           ├── page.tsx       # CharacterPage
│           └── page.module.css
├── components                 # Componentes reutilizables
│   ├── CharacterCard
│   ├── Header
│   ├── SearchBar
│   └── SkipLink               # Componente para accesibilidad
├── context
│   ├── CharactersContext.tsx
│   ├── FavoritesContext.tsx
│   └── UIContext.tsx
├── hooks
│   ├── useDebounce.ts
│   └── useLocalStorage.ts     # Gestión optimizada de localStorage
├── services
│   ├── /tests
│   └── api.ts
└── tests
    └── test-utils.tsx         # renderWithProviders que envuelve con todos los contextos
```

---

## **5. Instalación y Ejecución**

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/CristoAMH/marvel-app.git
   ```
2. **Instalar dependencias**:
   ```bash
   cd marvel-app
   npm install
   ```
3. **Configurar variables** en `.env`:
   ```env
   NEXT_PUBLIC_MARVEL_API_BASE=https://gateway.marvel.com/v1/
   NEXT_PUBLIC_MARVEL_PUBLIC_KEY=TU_PUBLIC_KEY
   MARVEL_PRIVATE_KEY=TU_PRIVATE_KEY
   ```
4. **Ejecutar en modo desarrollo**:

   ```bash
   npm run dev
   ```

   - Accede a http://localhost:3000

5. **Modo Producción**:
   ```bash
   npm run build
   npm run start
   ```

---

## **6. Testing**

- **Jest** + **React Testing Library**:
  ```bash
  npm run test
  ```
- **Cobertura**:
  ```bash
  npm run test:coverage
  ```

Los tests a mi en lo personal me gusta situarlos cerca del componente que los usa

- **`homepage.test.tsx`**: Verifica la búsqueda de personajes, el toggle de favoritos y el contador en el header.
- **`characterpage.test.tsx`**: Prueba la carga de un personaje, sus cómics y la lógica de favoritos (incluyendo la navegación de vuelta a la Home con `showFavorites` activo).

---

## **7. Decisiones de Diseño Destacadas**

1. **Context API en lugar de Redux**

   - Se buscó **simplicidad** y la app no requería un store complejo. Dividir en tres contextos (Characters, Favorites, UI) clarifica la responsabilidad de cada uno.

2. **Arquitectura "modular"**

   - Separar la capa de **servicios** (`api.ts`) de la lógica de estado (contextos) y las vistas (Home, CharacterPage) simplifica la comprensión.
   - Extracción de componentes reutilizables para mejorar mantenibilidad y cohesión del código.

3. **Accesibilidad**

   - Implementación de `SkipLink` para navegación por teclado.
   - Botones de favorito con `aria-label` (`add X to favorites` / `remove X from favorites`).
   - `srOnly` para encabezados invisibles en la Home, evitando romper la semántica de `h1`.
   - `aria-live` para regiones dinámicas como contador de resultados y favoritos.
   - Atributos `aria-hidden="true"` en elementos decorativos.
   - Unido a lo anteror, un buen marcado semántico.

4. **Custom Hooks para patrones reutilizables**

   - `useLocalStorage`: Abstrae y optimiza la persistencia en localStorage.
   - `useDebounce`: Evita saturar la API con cada pulsación en búsquedas.

5. **Testing**

   - **`test-utils.tsx`**: Envuelve con `CharactersProvider`, `FavoritesProvider`, `UIProvider`, permitiendo tests **integrales** sin mocks artificiales de contextos.
   - Limpia `localStorage` tras cada test para evitar contaminación del estado de favoritos.

6. **No Hexagonal / MVC**
   - Dada la complejidad actual (una sola fuente de datos, lógicas de UI manejables), se prefirió **no** añadir capas extra.
   - **Hexagonal** es ideal cuando hay múltiples capas (dominio, infra) y mayor complejidad de negocio. **MVC** es más común en frameworks server-side.
   - Aquí, la **Context API + Next.js** bastan para un flujo claro y mantenible.

---

## **8. Futuras Mejoras**

- **SSR/ISR**: Para mejorar SEO de la Home (si la API lo permite).
- **Paginación** o "Infinite Scroll" en la Home para personajes.
- **Internacionalización** si se requiere en varios idiomas.
- **Sistema de cache** más avanzado con TTL (Time To Live) e invalidaciones.
- **Mejor control de errores** (p.ej. mostrar un mensaje si la API de Marvel falla).
- **Optimización de imágenes** con alternativas adaptativas según tamaño de pantalla.
- **Sistemas de logs** para monitorizar eventos y errores en producción.
