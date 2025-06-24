'use client';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);
  console.error({ digest: error.digest });
  return (
    <html>
      <body className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-4 px-4">
          <h2 className="text-2xl font-light tracking-tight">Something went wrong</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{error.message}</p>
          <Button 
            onClick={() => reset()}
            className="px-6 py-2 transition-colors hover:bg-gray-800 dark:hover:bg-gray-100"
          >
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}
