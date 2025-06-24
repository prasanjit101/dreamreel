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
import { ProjectSelectorDialog } from "@/components/project-selector-dialog";
import { ProjectWrapper } from "@/components/project-wrapper";

export default async function Home() {
  const session = await getSession();

  return (
    <HydrateClient>
      {!session && <LoginDialog />}
      {session && <ProjectWrapper />}
      <Toaster position="top-right" />
    </HydrateClient>
  );
}