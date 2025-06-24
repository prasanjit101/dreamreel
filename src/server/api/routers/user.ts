import { z } from 'zod';

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from '@/server/api/trpc';
import { eq } from 'drizzle-orm';
import { user } from '@/server/db/schema';
import { updateUserSchema } from '@/server/db/schema/user';

export const userRouter = createTRPCRouter({
    updateUser: protectedProcedure
        .input(updateUserSchema)
        .mutation(async ({ ctx, input }) => {

            const updatedUser = await ctx.db
                .update(user)
                .set(input)
                .where(eq(user.id, ctx.session.user.id))
                .returning()
                .get();

            return updatedUser;
        }),
    getUser: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const u = await ctx.db
                .select()
                .from(user)
                .where(eq(user.id, input.id))
                .get();

            return u;
        }),
    getAllUsers: publicProcedure
        .input(z.object({
            limit: z.number().min(1).max(100).default(10),
            offset: z.number().min(0).default(0),
        }))
        .query(async ({ ctx, input }) => {
            const users = await ctx.db
                .select()
                .from(user)
                .limit(input.limit)
                .offset(input.offset)
                .all();

            return users;
        }),
});
