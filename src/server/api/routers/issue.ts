import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { ReviewStatus, ReviewType } from "@prisma/client";

export const issueRouter = createTRPCRouter({
  getIssues: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.issue.findMany({
      include: {
        threads: {
          include: {
            comments: { include: { user: true } },
            user: true,
          },
        },
        reviews: { include: { reviewer: true } },
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
        reviewerIds: z.string().cuid().array(),
        approverIds: z.string().cuid().array(),
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
          reviews: {
            createMany: {
              data: input.reviewerIds
                .map((id) => ({
                  status: "draft" as const satisfies ReviewStatus,
                  type: "intermediate" as ReviewType,
                  reviewerId: id,
                }))
                .concat(
                  input.approverIds.flatMap((id) => ({
                    status: "draft" as const satisfies ReviewStatus,
                    type: "final" as ReviewType,
                    reviewerId: id,
                  }))
                ),
            },
          },
        },
      });
    }),
});
