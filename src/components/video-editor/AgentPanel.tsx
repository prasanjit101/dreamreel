import React from 'react';
import { Input } from "@/components/ui/input";
import Image from 'next/image';
import Link from 'next/link';

const AgentPanel: React.FC = () => {
    return (
        <div className="h-full relative w-full bg-card border-l border-border p-4 flex flex-col items-center text-center justify-center gap-4">
            {/* Bolt Badge at the top, hyperlinked */}
            <Link
                href="https://bolt.new/"
                target="_blank"
                rel="noopener noreferrer"
                className="mb-2 transition-transform hover:scale-105"
                title="Powered by Bolt"
            >
                <Image
                    src="/bolt_badge.png"
                    alt="Bolt Badge"
                    className="w-20 h-auto mx-auto drop-shadow-lg"
                    width={80}
                    height={80}
                />
            </Link>
            <p className="text-sm">This is the place for the Dreamreel Agent</p>
            <p className='text-xs text-gray-400'>He is coming!</p>
        </div>
    );
};

export default AgentPanel;
