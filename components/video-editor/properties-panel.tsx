"use client";

import { ScrollArea } from "../ui/scroll-area";

export function PropertiesPanel() {
    return (
        <ScrollArea className="w-full bg-card border-t border-border p-4 max-h-42">
            <div className="text-center space-y-4">
                <div className="space-y-2">
                    <h3 className="text-foreground font-medium">No item selected</h3>
                    <p className="text-muted-foreground text-sm">Select an item to see its properties</p>
                </div>
            </div>
        </ScrollArea>
    );
}
