'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { LoginButton } from './login-form';
import { Logo } from './Logo';

export function LoginDialog() {
    return (
        <Dialog open={true}>
            <DialogContent
                showCloseButton={false}
                onEscapeKeyDown={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
                className="max-w-sm py-12"
            >
                <DialogHeader className="items-center">
                    <Logo />
                    <DialogTitle className="text-2xl pt-4">Welcome to Dreamreel</DialogTitle>
                    <DialogDescription>
                        Please sign in to continue to the editor.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center py-4">
                    <LoginButton text="Sign in with Google" />
                </div>
            </DialogContent>
        </Dialog>
    );
} 