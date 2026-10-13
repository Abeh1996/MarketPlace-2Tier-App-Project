function notFound(req, res) {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl
  });
}

function errorHandler(
  err,
  req,
  res,
  next
) {
  console.error(err);

  res.status(500).json({
    error: "Internal server error"
  });
}

module.exports = {
  notFound,
  errorHandler
};