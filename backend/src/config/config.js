require("dotenv").config();
const config = {
  port: Number(process.env.PORT || 4000),

  databaseUrl:
    process.env.DATABASE_URL,

  corsOrigin:
    process.env.CORS_ORIGIN ||
    "http://localhost:5500"
};

module.exports = config;