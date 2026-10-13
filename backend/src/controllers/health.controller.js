exports.health = async (req, res) => {
  res.json({
    status: "ok",
    service: "marketplace-backend",
    timestamp: new Date().toISOString()
  });
};