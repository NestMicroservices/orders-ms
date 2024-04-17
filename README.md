# Orders Microservice


## Dev
1. Clone the repository
2. Install dependencies
3. Run docker database `docker compose up -d`
4. Create a `.env` file based on the `.env.template`
5. Run prisma migration `pnpm prisma migre dev`
6. Run prisma client `pnpm prisma generate`
7. Run `pnpm run start:dev`