# Wayfarer Backend App

Full-stack application containing data-safe tour booking and honest algorithmic place rankings.

### Setup Instructions
1. Run `npm install` to load all packages.
2. Run `npx prisma migrate dev --name init` to generate the SQLite file.
3. Run `npx ts-node prisma/seed.ts` to populate user records.

to see the database table run `npx prisma studio`
### Launch Server
Run `npm run start:dev` to turn on the local NestJS server.
