const orderService =
  require("../services/order.service");

exports.createOrder = async (req, res) => {
  const order =
    await orderService.createOrder(
      req.body
    );

  res.status(201).json(order);
};

exports.getOrder = async (req, res) => {
  const order =
    await orderService.getOrder(
      Number(req.params.id)
    );

  if (!order) {
    return res.status(404).json({
      error: "Order not found"
    });
  }

  res.json(order);
};