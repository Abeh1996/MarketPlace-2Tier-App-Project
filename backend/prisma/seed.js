const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const restaurant1 = await prisma.restaurant.create({
    data: {
      name: "Douala Grill",
      address: "Bonapriso, Douala",
      status: "OPEN",
    },
  });

  const restaurant2 = await prisma.restaurant.create({
    data: {
      name: "Yaounde Kitchen",
      address: "Bastos, Yaounde",
      status: "OPEN",
    },
  });

  await prisma.menuItem.createMany({
    data: [
      {
        restaurantId: restaurant1.id,
        name: "Grilled Chicken",
        price: 8.5,
        available: true,
      },
      {
        restaurantId: restaurant1.id,
        name: "Beef Burger",
        price: 6.0,
        available: true,
      },
      {
        restaurantId: restaurant2.id,
        name: "Jollof Rice",
        price: 7.0,
        available: true,
      },
      {
        restaurantId: restaurant2.id,
        name: "Grilled Fish",
        price: 9.5,
        available: true,
      },
    ],
  });

  console.log("Seed data created successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });