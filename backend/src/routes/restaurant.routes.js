const express = require("express");

const controller =
  require("../controllers/restaurant.controller");

const router = express.Router();

router.get(
  "/",
  controller.getRestaurants
);

router.get(
  "/:id/menu",
  controller.getMenu
);

module.exports = router;