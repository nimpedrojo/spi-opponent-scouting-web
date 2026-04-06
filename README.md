# spi-opponent-scouting-web

Frontend foundation for the SPI Opponent Scouting product.

## Stack

- React
- TypeScript
- Vite
- React Router
- React Query
- React Hook Form
- ESLint + Prettier

## Project Structure

```text
src/
  app/
    layout/
    providers/
    routes/
    styles/
  features/
    opponents/
    report-editor/
    report-preview/
    reports/
  shared/
    api/
    forms/
    lib/
    ui/
```

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
cp .env.example .env.local
```

3. Start the development server:

```bash
npm run dev
```

4. Open the application:

```bash
http://localhost:5173
```

## Available Scripts

- `npm run dev` starts the Vite development server
- `npm run build` creates a production build
- `npm run preview` serves the production build locally
- `npm run lint` checks code quality with ESLint
- `npm run lint:fix` fixes lint issues where possible
- `npm run format` formats the codebase with Prettier
- `npm run format:check` validates formatting
- `npm run typecheck` runs the TypeScript app check without emitting files
