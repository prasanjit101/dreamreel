'use client';

import { signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function SignOutBtn({ className }: { className?: string }) {
  const router = useRouter();
  return <Button variant={'destructive'} className={cn('cursor-pointer', className)} onClick={async () => await signOut({
    fetchOptions: {
      onSuccess: () => {
        router.push("/"); // redirect to login page
      },
    },
  })}>Sign Out</Button>;
}
