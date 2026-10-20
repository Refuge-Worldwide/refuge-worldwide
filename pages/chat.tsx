import PageMeta from "../components/seo/page";
import ChatRoom from "../components/chatRoom";
import LivePlayer from "../components/livePlayer";
import Head from "next/head";

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

export default function ChatPage() {
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

ChatPage.noLayout = true;
