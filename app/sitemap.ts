import { env } from "@/env";

export default function Sitemap() {
    const baseUrl = env.NEXT_PUBLIC_APP_URL;
    const routes = [''].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return [...routes];
}
