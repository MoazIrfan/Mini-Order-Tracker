import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { PrismaClient, FulfillmentStatus } from "@prisma/client";

const prisma = new PrismaClient();

export const ordersRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({ 
      page: z.number().min(1), 
      limit: z.number().min(1),
    }))
    .query(async ({ ctx, input }) => {
      const { page, limit } = input;

      const orders = await ctx.db.order.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: {
          customer: true,
          orderLineItems: {
            include: {
              product: true,
            },
          },
        },
      });

      return { orders };
    }),
});
