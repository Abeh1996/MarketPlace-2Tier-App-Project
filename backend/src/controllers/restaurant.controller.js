const restaurantService =
  require("../services/restaurant.service");

exports.getRestaurants = async (req, res) => {
  const restaurants =
    await restaurantService.getOpenRestaurants();

  res.json({
    data: restaurants
  });
};

exports.getMenu = async (req, res) => {
  const restaurantId =
    Number(req.params.id);

  const menu =
    await restaurantService.getMenu(
      restaurantId
    );

  res.json({
    data: menu
  });
};