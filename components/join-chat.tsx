import MessageSquare from "../icons/message-square";
import { useState } from "react";
import { Cross } from "../icons/cross";
import useSchedule from "../hooks/useSchedule";
import ChatRoom from "./chatRoom";

export default function JoinChat() {
  const { scheduleData } = useSchedule();

  if (scheduleData?.liveNow?.isMixedFeelings) return null;

  return (
    <div className="fixed bottom-5 right-4 hidden md:block z-30">
      <ChatWidget />
    </div>
  );
}

const ChatWidget = () => {
  const [openChat, setOpenChat] = useState<boolean>(false);
  const [hasOpened, setHasOpened] = useState<boolean>(false);

  const handleOpen = () => {
    setHasOpened(true);
    setOpenChat(true);
  };

  return (
    <>
      {hasOpened && (
        <div
          className={`flex flex-col h-[500px] w-[350px] bg-black text-white overflow-hidden ${
            openChat ? "block" : "hidden"
          }`}
        >
          <div className="flex-shrink-0 h-[50px] px-4 border-b border-white/20 flex items-center gap-4">
            <span className="leading-6 flex-grow text-small">Chatroom</span>
            <button onClick={() => setOpenChat(false)}>
              <Cross colour="white" strokeWidth="2" />
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <ChatRoom />
          </div>
        </div>
      )}
      {!openChat && (
        <button
          onClick={handleOpen}
          className="inline-flex items-center py-3 px-4 pl-5 gap-3 border-2 rounded-full bg-black text-white border-orange shadow-pill-orange focus:outline-none focus:ring-4 font-light"
        >
          <span className="hidden sm:inline leading-6">Join the chatroom</span>
          <MessageSquare size={24} className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      )}
    </>
  );
};
