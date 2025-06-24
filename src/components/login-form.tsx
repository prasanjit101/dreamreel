'use client';
import { Button, ButtonProps } from '@/components/ui/button';


import { signInGoogle } from '@/lib/auth-client';
import { env } from 'env';

export function LoginButton({
  redirectUrl,
  text = 'Sign up',
  ...props
}: ButtonProps & {
  redirectUrl?: string;
    text: string;
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
