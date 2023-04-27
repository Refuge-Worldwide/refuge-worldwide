import MessageSquare from "../icons/message-square";
import { useState } from "react";
import { Cross } from "../icons/cross";
import { Arrow } from "../icons/arrow";
import { DISCORD_INVITE_URL } from "../constants";
import DiscordEmbed from "./DiscordEmbed";

export default function JoinChat() {
  return (
    <div className="fixed bottom-4 right-4 hidden sm:block z-50">
      <ChatRoom />
    </div>
  );
}

const ChatRoom = () => {
  const [openChat, setOpenChat] = useState<boolean>(false);
  if (openChat) {
    return (
      <div className="relative">
        <div className="absolute top-0 left-0 w-full bg-black text-white h-[50px] px-4 border-b border-white rounded-t-xl">
          <div className="flex gap-4 items-center h-full">
            <span className="leading-6 flex-grow">Chatroom</span>
            <a href={DISCORD_INVITE_URL} target="_blank">
              <Arrow className="-rotate-45" colour="white" />
            </a>
            <button onClick={() => setOpenChat(false)}>
              <Cross colour="white" strokeWidth="2" />
            </button>
          </div>
        </div>
        <div className="h-[500px] w-[350px]">
          <DiscordEmbed />
        </div>
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
