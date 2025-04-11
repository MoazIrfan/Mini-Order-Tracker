import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create Products
  await prisma.product.createMany({
    data: [
      { name: "T-Shirt", price: 19.99 },
      { name: "Laptop", price: 899.99 },
      { name: "Coffee Mug", price: 9.99 },
      { name: "Notebook", price: 5.99 },
    ],
  });

  // Create Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: "John Doe",
      address: "123 Elm Street, Springfield",
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: "Jane Smith",
      address: "456 Oak Avenue, Shelbyville",
    },
  });

  // Create Orders with Line Items
  await prisma.order.create({
    data: {
      customerId: customer1.id,
      fulfillmentStatus: "PENDING",
      orderLineItems: {
        create: [
          { productId: 1, quantity: 2 }, // 2 T-Shirts
          { productId: 3, quantity: 1 }, // 1 Coffee Mug
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      customerId: customer2.id,
      fulfillmentStatus: "FULFILLED",
      orderLineItems: {
        create: [
          { productId: 2, quantity: 1 }, // 1 Laptop
          { productId: 4, quantity: 3 }, // 3 Notebooks
        ],
      },
    },
  });

  console.log("🌱 Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
