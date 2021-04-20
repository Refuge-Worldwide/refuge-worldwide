import PageMeta from "../components/seo/page";
import dynamic from "next/dynamic";

const Chatango = dynamic(() => import("../components/chatango"), {
  ssr: false,
});

export default function ChatPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageMeta title="Chat | Refuge Worldwide" path="chat/" />

      <Chatango />

      <style jsx global>{`
        iframe {
          flex: 1;
        }
      `}</style>
    </div>
  );
}

ChatPage.noLayout = true;
