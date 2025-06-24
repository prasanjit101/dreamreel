// 'use server';
// import { Client } from '@upstash/qstash';
// import { z } from 'zod';
// import { verify } from '@/lib/server-utils/utils';
// import { env } from '@/env';

// const startBackgroundJobSchema = z.object({
// 	url: z.string().url(),
// 	body: z.any(),
// 	callback: z.string().url().optional(),
// 	retries: z.number().max(3).default(3).optional(),
// 	failureCallback: z.string().url().optional(),
// 	method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional().default('POST'),
// 	delay: z.number().optional(), // seconds
// });
// type StartBackgroundJob = z.infer<typeof startBackgroundJobSchema>;


// const qstashClient = new Client({
// 	token: env.QSTASH_TOKEN,
// 	retry: {
// 		backoff: (retry_count) => 60 * 5 * 1000,
// 	},
// });

// export async function startQstashBackgroundJob(params: StartBackgroundJob) {
// 	try {
// 		const parsedData = startBackgroundJobSchema.parse(params);
// 		const qstashResult = await qstashClient.publishJSON(parsedData);
// 		console.log(`Published to Qstash -  `);
// 	} catch (error) {
// 		console.error(error);
// 		return null;
// 	}
// }

// export async function verifyQstashCallback(signature: string, url: string, body: any) {
// 	const currentSigningKey = env.QSTASH_CURRENT_SIGNING_KEY;
// 	const nextSigningKey = env.QSTASH_NEXT_SIGNING_KEY;
// 	try {
// 		await verify(signature, currentSigningKey!, body, url).catch((err) => {
// 			console.error(`Failed to verify signature with current signing key: ${err}`);
// 			return verify(signature, nextSigningKey!, body, url);
// 		});
// 		return true;
// 	} catch (err: any) {
// 		console.error(`Failed to verify signature: ${err?.message}`);
// 		return false;
// 	}
// }