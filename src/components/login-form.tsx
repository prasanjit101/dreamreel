'use client';
import { Button } from '@/components/ui/button';


import { signInGoogle } from '@/lib/auth-client';
import { env } from 'env';

export function LoginButton({
  redirectUrl,
  text = 'Sign up',
  ...props
}: {
  redirectUrl?: string;
  text?: string;
} & React.ComponentProps<typeof Button> & {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}) {

  return (
    <Button
      onClick={() => signInGoogle({ callbackURL: redirectUrl ?? env.NEXT_PUBLIC_APP_URL + '/dashboard' })}
      {...props}
    >
      {text}
    </Button>
  );
}
