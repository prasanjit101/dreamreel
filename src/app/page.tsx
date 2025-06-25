import { Navbar } from "@/components/video-editor/Navbar";
import { Sidebar } from "@/components/video-editor/sidebar";
import { AssetBox } from "@/components/video-editor/AssetBox";
import VideoPlayer from "@/components/video-editor/VideoPlayer";
import { PropertiesPanel } from "@/components/video-editor/PropertiesPanel";
import Timeline from "@/components/video-editor/Timeline";
import { Toaster } from "sonner";
import AgentPanel from "@/components/video-editor/AgentPanel";
import { HydrateClient } from '@/trpc/server';
import { getSession } from "auth";
import { LoginDialog } from "@/components/login-dialog";


export default async function Home() {
  const session = await getSession();

  return (
    <HydrateClient>
      {!session && <LoginDialog />}
      <div className="h-screen flex flex-col bg-background">
        {/* Top Navigation Bar */}
        <Navbar />

        {/* Main Editor Area */}
        <div className="flex-1 flex">
          {/* Left Panel */}
          <div className="flex flex-col border-r border-border">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto border-b border-border">
                <AssetBox />
              </div>
              <div className="flex-1 overflow-y-auto">
                <PropertiesPanel />
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col max-w-4xl">
            {/* Main Player Area */}
            <VideoPlayer />
            <Timeline />
          </div>

          {/* Right Sidebar with Properties */}
          <div className="w-65 border-l border-border flex flex-col">
            <AgentPanel />
          </div>
        </div>

        {/* Toast notifications */}
        <Toaster position="top-right" />
      </div>
    </HydrateClient>
  );
}
