import MessageSquare from "../icons/message-square";
import { useState } from "react";
import WidgetBot from "@widgetbot/react-embed";
import { Cross } from "../icons/cross";
import { Arrow } from "../icons/arrow";

export default function JoinChat() {
  return (
    <div className="fixed bottom-4 right-4 hidden sm:block">
      <ChatRoom />
    </div>
  );
}

const ChatRoom = () => {
  const [openChat, setOpenChat] = useState<boolean>(false);
  if (openChat) {
    return (
      <div className="relative">
        <div className="absolute top-0 left-0 w-full bg-[#313338] text-white h-[50px] px-4 border-b border-white">
          <div className="flex gap-4 items-center h-full">
            <span className="font-medium flex-grow">Chatroom</span>
            <a href="https://discord.gg/QJgtWbSz" target="_blank">
              <Arrow className="-rotate-45" colour="white" />
            </a>
            <button onClick={() => setOpenChat(false)}>
              <Cross colour="white" strokeWidth="2" />
            </button>
          </div>
        </div>
        <WidgetBot
          className="h-[500px] w-[350px]"
          server="1077626733458620487"
          channel="1077626735132164096"
        />
      </div>
    );
  } else {
    return (
      <button
        onClick={() => setOpenChat(true)}
        className="inline-flex items-center py-3 px-4 pl-5 gap-3 border-2 rounded-full bg-black text-white border-orange shadow-pill-orange focus:outline-none focus:ring-4 font-light"
      >
        <span className="hidden sm:inline leading-6">Join the chatroom</span>
        <MessageSquare size={24} className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
    );
  }
};
