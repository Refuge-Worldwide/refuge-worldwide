import PageMeta from "../components/seo/page";
import ChatRoom from "../components/chatRoom";
import DiscordEmbed from "../components/DiscordEmbed";
import LivePlayer from "../components/livePlayer";
import { DISCORD_INVITE_URL } from "../constants";
import { useDirectusUser } from "../hooks/useDirectusUser";
import { BsDiscord } from "react-icons/bs";
import Head from "next/head";

export default function ChatPage() {
  const { showSupporters } = useDirectusUser();

  return showSupporters ? <NewChatPage /> : <DiscordChatPage />;
}

function ChatHead() {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
      </Head>
      <PageMeta title="Chat | Refuge Worldwide" path="chat/" />
    </>
  );
}

function NewChatPage() {
  return (
    <div className="flex flex-col bg-black h-screen overflow-hidden">
      <ChatHead />
      <div className="flex-shrink-0">
        <LivePlayer />
      </div>
      <div className="flex-shrink-0 bg-black text-white h-[50px] px-4 border-y border-white/20 flex items-center">
        <span className="leading-6">Chatroom</span>
      </div>
      <div className="flex-1 min-h-0 pb-safe">
        <ChatRoom />
      </div>
    </div>
  );
}

function DiscordChatPage() {
  return (
    <div className="flex flex-col bg-[#36393E] h-screen">
      <ChatHead />
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
      <div className="w-full h-[calc(100vh-130px)] sm:h-[calc(100vh-55px)] pb-safe">
        <DiscordEmbed />
      </div>
    </div>
  );
}

ChatPage.noLayout = true;
