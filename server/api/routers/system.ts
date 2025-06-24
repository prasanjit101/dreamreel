
import {
    createTRPCRouter,
    publicProcedure,
} from '@/server/api/trpc';

export const systemRouter = createTRPCRouter({
    hello: publicProcedure.query(async ({ ctx }) => {
        return 'Hello, world!';
    }),
});
