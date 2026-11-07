# Wayfarer

Full-stack app for exploring places, booking tours, and viewing honest ranking data.

## 3-step setup

1. Install the dependencies for both apps:

   ```bash
   cd backend && npm install
   cd frontend && npm install
   ```

2. Create the SQLite database and seed demo data:

   ```bash
   cd backend
   npx prisma migrate dev --name init
   npm run seed
   ```

3. Start the apps in separate terminals:

   ```bash
   cd backend && npm run start:dev
   cd ../frontend && npm run dev
   ```

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API docs: http://localhost:3001/docs

> Optional: use `npx prisma studio` to inspect the SQLite database, or `npm run test:wayfarer` to run the project tests.

## Screenshot

![Wayfarer app screenshot](frontend/public/screenshot.jpg)
