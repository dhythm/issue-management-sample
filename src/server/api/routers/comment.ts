import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

export const commentRouter = createTRPCRouter({
  createThread: publicProcedure
    .input(
      z.object({
        issueId: z.string().cuid(),
        userId: z.string().cuid(),
        title: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.thread.create({
        data: {
          title: input.title,
          resolved: false,
          issueId: input.issueId,
          userId: input.userId,
        },
      });
    }),
  createComment: publicProcedure
    .input(
      z.object({
        threadId: z.string().cuid(),
        userId: z.string().cuid(),
        content: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.comment.create({
        data: {
          content: input.content,
          threadId: input.threadId,
          userId: input.userId,
        },
      });
    }),
});
