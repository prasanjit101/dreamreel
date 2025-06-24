'use client';
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

export function SuperButton() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 right-8 z-50 hidden md:block"
            whileHover={{ x: -10 }}
        >
            <Button
                data-tally-open="wQjYxg" data-tally-width="540" data-tally-hide-title="1" data-tally-auto-close="1000"
                className="transform bg-primary rotate-90 origin-bottom-right px-4 pb-4 pt-9"
            >
                <Lightbulb className="size-4" /> <p className="tracking-wide">Give feedback</p>
            </Button>
        </motion.div>
    );
}
