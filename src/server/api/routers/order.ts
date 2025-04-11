import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { PrismaClient, FulfillmentStatus } from "@prisma/client";

const prisma = new PrismaClient();

export const ordersRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({ 
      page: z.number().min(1), 
      limit: z.number().min(1),
      status: z.nativeEnum(FulfillmentStatus).optional(),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { page, limit, status, search } = input;

      // Building the whereClause dynamically
      const whereClause: any = {};


      if (status) {
        whereClause.fulfillmentStatus = status;
      }

      if (search && search.trim() !== "") {
        whereClause.customer = {
          name: {
            contains: search,
            mode: "insensitive",
          },
        };
      }

      const orders = await ctx.db.order.findMany({
        where: whereClause,
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

      const totalOrders = await ctx.db.order.count({
        where: whereClause,
      });

      const totalPages = Math.ceil(totalOrders / limit);

      return { orders, totalOrders, totalPages };
    }),
});
