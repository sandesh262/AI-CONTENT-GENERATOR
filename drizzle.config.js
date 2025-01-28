

/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.tsx",
    dialect: 'postgresql',
    dbCredentials: {
      url:"postgresql://neondb_owner:daiFxr0p9MeO@ep-jolly-cell-a9rjnvuw.gwc.azure.neon.tech/ai-content-generator?sslmode=require"
    }
  };