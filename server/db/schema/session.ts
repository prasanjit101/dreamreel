import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { user } from "./user";
import { createId } from "@paralleldrive/cuid2";

export const session = sqliteTable("session", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
});
