'use client';
import { ArrowLeft } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function GoHome() {
  return (
    <Link
      href={'/'}
      className={cn(
        'flex items-center p-0',
        buttonVariants({
          variant: 'link',
        }),
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      Home
    </Link>
  );
}

export function GoBack() {
  return (
    <Button size={'sm'} variant={'ghost'} onClick={() => window.history.back()}>
      <ArrowLeft className="h-4 w-4" /> back
    </Button>
  );
}
