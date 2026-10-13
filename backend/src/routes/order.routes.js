const express = require("express");

const controller =
  require("../controllers/order.controller");

const router = express.Router();

router.post(
  "/",
  controller.createOrder
);

router.get(
  "/:id",
  controller.getOrder
);

module.exports = router;