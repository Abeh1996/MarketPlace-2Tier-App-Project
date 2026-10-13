const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const config = require("./config/config");

const healthRoutes =
  require("./routes/health.routes");

const restaurantRoutes =
  require("./routes/restaurant.routes");

const orderRoutes =
  require("./routes/order.routes");

const {
  notFound,
  errorHandler
} = require("./middleware/errorHandler");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: config.corsOrigin
  })
);

app.use(express.json());

app.use(morgan("dev"));

app.use("/health", healthRoutes);

app.use(
  "/api/restaurants",
  restaurantRoutes
);

app.use(
  "/api/orders",
  orderRoutes
);

app.use(notFound);
app.use(errorHandler);

module.exports = app;