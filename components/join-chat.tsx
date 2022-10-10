import { useCallback } from "react";
import MessageSquare from "../icons/message-square";

export default function JoinChat() {
  const openChat = useCallback(() => {
    const chatOptions =
      "width=480,height=520,menubar=no,location=no,resizable=no,scrollbars=no,status=no";

    window.open("/chat", "refugechatwindow", chatOptions);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 hidden sm:block">
      <button
        onClick={openChat}
        className="inline-flex items-center py-3 px-4 pl-5 gap-3 border-2 rounded-full bg-black text-white border-orange shadow-pill-orange focus:outline-none focus:ring-4 font-light"
      >
        <span className="hidden sm:inline leading-6">Join the chatroom</span>
        <MessageSquare size={24} className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
    </div>
  );
}
