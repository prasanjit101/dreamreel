import { env } from '@/env'
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/dashboard/', '/api/'],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/dashboard/', '/api/'],
                crawlDelay: 10,
            }
        ],
        sitemap: `${env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
        host: env.NEXT_PUBLIC_APP_URL,
    }
}
