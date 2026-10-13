const prisma =
  require("../database/prisma");

exports.getOpenRestaurants =
  async () => {

    return prisma.restaurant.findMany({
      where: {
        status: "OPEN"
      },
      orderBy: {
        name: "asc"
      }
    });
  };

exports.getMenu =
  async (restaurantId) => {

    return prisma.menuItem.findMany({
      where: {
        restaurantId,
        available: true
      },
      orderBy: {
        name: "asc"
      }
    });
  };