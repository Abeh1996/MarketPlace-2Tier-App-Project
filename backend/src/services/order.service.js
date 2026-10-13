const prisma =
  require("../database/prisma");

exports.createOrder =
  async (data) => {

    const restaurant =
      await prisma.restaurant.findUnique({
        where: {
          id: data.restaurantId
        }
      });

    if (!restaurant) {
      throw new Error(
        "Restaurant not found"
      );
    }

    let totalAmount = 0;

    const items = [];

    for (const item of data.items) {

      const menuItem =
        await prisma.menuItem.findUnique({
          where: {
            id: item.menuItemId
          }
        });

      if (!menuItem) {
        throw new Error(
          "Menu item not found"
        );
      }

      totalAmount +=
        Number(menuItem.price) *
        item.quantity;

      items.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: menuItem.price
      });
    }

    return prisma.order.create({
      data: {
        restaurantId:
          data.restaurantId,

        totalAmount,

        items: {
          create: items
        }
      },

      include: {
        items: true
      }
    });
  };

exports.getOrder =
  async (id) => {

    return prisma.order.findUnique({
      where: { id },

      include: {
        items: true,
        restaurant: true
      }
    });
  };