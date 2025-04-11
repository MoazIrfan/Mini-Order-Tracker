import { PrismaClient } from "@prisma/client";
import { faker } from '@faker-js/faker'; // Make sure you install it: npm i @faker-js/faker

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
  const customers = [];
  for (let i = 0; i < 23; i++) {
    const customer = await prisma.customer.create({
      data: {
        name: faker.person.fullName(),
        address: faker.location.streetAddress({ useFullAddress: true }),
      },
    });
    customers.push(customer);
  }

  // Create random Orders for Customers
  for (const customer of customers) {
    const numberOfOrders = faker.number.int({ min: 1, max: 3 });

    for (let i = 0; i < numberOfOrders; i++) {
      await prisma.order.create({
        data: {
          customerId: customer.id,
          fulfillmentStatus: faker.helpers.arrayElement([
            "PENDING",
            "FULFILLED",
            "CANCELLED",
            "SHIPPED",
            "RETURNED",
          ]),
          orderLineItems: {
            create: [
              {
                productId: faker.number.int({ min: 1, max: 4 }),
                quantity: faker.number.int({ min: 1, max: 5 }),
              },
              {
                productId: faker.number.int({ min: 1, max: 4 }),
                quantity: faker.number.int({ min: 1, max: 5 }),
              },
            ],
          },
        },
      });
    }
  }

  console.log("🌱 Seeding completed with random data!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
