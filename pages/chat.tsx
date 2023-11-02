import { useRef } from "react";
import PageMeta from "../components/seo/page";
import DiscordEmbed from "../components/DiscordEmbed";
import { DISCORD_INVITE_URL } from "../constants";
import LivePlayer from "../components/livePlayer";
import { BsDiscord } from "react-icons/bs";
export default function ChatPage() {
  const ref = useRef<HTMLDivElement>();

  return (
    <div ref={ref} className="flex flex-col bg-black h-screen">
      <PageMeta title="Chat | Refuge Worldwide" path="chat/" />

      <div className="h-screen w-screen max-h-lg mx-auto bg-[#36393E]">
        <LivePlayer />
        <div className="absolute top-12 sm:top-16 left-0 w-full bg-black text-white h-[50px] px-4 border-b border-white border-t">
          <div className="flex gap-4 items-center h-full">
            <span className="leading-6 flex-grow">Chatroom</span>
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#36393E] py-2 px-4 rounded-full text-small"
            >
              <p>Join our Discord</p>
              <BsDiscord color="white" />
            </a>
          </div>
        </div>
        <div className="w-full h-[calc(100vh-40px)] sm:h-[calc(100vh-55px)] mb-safe">
          <DiscordEmbed />
        </div>
      </div>
    </div>
  );
}

ChatPage.noLayout = true;
