import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

export const issueRouter = createTRPCRouter({
  getIssues: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.issue.findMany({
      include: {
        threads: {
          include: { comments: { include: { user: true } }, user: true },
        },
      },
    });
  }),
  getIssue: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.issue.findFirst({ where: { id: input.id } });
    }),
  createIssue: publicProcedure
    .input(
      z.object({
        key: z.string(),
        title: z.string(),
        content: z.string(),
        authorId: z.string().cuid(),
        assigneeId: z.string().cuid(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.issue.create({
        data: {
          key: input.key,
          params: JSON.parse("{}"),
          title: input.title,
          content: input.content,
          authorId: input.authorId,
          assigneeId: input.assigneeId,
        },
      });
    }),
});
