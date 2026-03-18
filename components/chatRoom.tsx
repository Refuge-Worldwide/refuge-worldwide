import Image from "next/image";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { FC, useCallback, useEffect, useRef, useState } from "react";

const LS_USERNAME = "rw_chat_username";

interface ChatMessage {
  id: string;
  user_id: string | null;
  username: string;
  message: string;
  image: string | null;
  created_at: string;
}

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (msgDay.getTime() === today.getTime()) return `Today at ${time}`;
  if (msgDay.getTime() === yesterday.getTime()) return `Yesterday at ${time}`;
  return `${date.toLocaleDateString([], {
    day: "numeric",
    month: "long",
  })} at ${time}`;
}

const ChatRoom: FC = () => {
  const [supabase] = useState(() => createPagesBrowserClient());
  const user = useUser();

  const [username, setUsername] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [settingName, setSettingName] = useState(false);
  const [ready, setReady] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load identity from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(LS_USERNAME);
    if (stored) setUsername(stored);
    setReady(true);
  }, []);

  // Load messages and subscribe to realtime updates
  useEffect(() => {
    supabase
      .from("chat")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (data) setMessages((data as ChatMessage[]).reverse());
        setLoadingMessages(false);
      });

    const channel = supabase
      .channel("chat_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Scroll to bottom when messages arrive
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input after setting name
  useEffect(() => {
    if (username && !settingName && inputRef.current) {
      inputRef.current.focus();
    }
  }, [username, settingName]);

  const handleSetUsername = useCallback(() => {
    const name = nameInput.trim();
    if (name.length < 2 || name.length > 30) return;
    localStorage.setItem(LS_USERNAME, name);
    setUsername(name);
    setNameInput("");
    setSettingName(false);
  }, [nameInput]);

  const handleResetUsername = useCallback(() => {
    setNameInput(username ?? "");
    setSettingName(true);
  }, [username]);

  const handleSend = useCallback(async () => {
    if (!username || !input.trim() || sending) return;
    const text = input.trim().slice(0, 500);
    setInput("");
    setSending(true);
    try {
      await supabase.from("chat").insert({
        user_id: user?.id ?? null,
        username,
        message: text,
      });
    } finally {
      setTimeout(() => setSending(false), 1000);
    }
  }, [username, input, sending, supabase, user]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleNameKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSetUsername();
      }
      if (e.key === "Escape") {
        setSettingName(false);
        setNameInput("");
      }
    },
    [handleSetUsername]
  );

  if (!ready) return null;

  const showNameForm = !username || settingName;

  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Messages */}
      <div
        ref={listRef}
        className="chat-scrollbar flex-1 overflow-y-auto p-3 space-y-3"
      >
        {loadingMessages && (
          <p className="text-white/40 text-small text-center pt-6">
            Loading...
          </p>
        )}
        {!loadingMessages && messages.length === 0 && (
          <p className="text-white text-small text-center pt-6">
            No messages yet. Say hi!
          </p>
        )}
        {messages.map((msg) =>
          msg.username === "Refuge Worldwide" ? (
            <div key={msg.id} className="py-2 space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/20" />
                <span className="text-tiny text-white/50 flex-shrink-0">
                  Live now: {msg.message}
                </span>
                <div className="flex-1 h-px bg-white/20" />
              </div>
              {msg.image && (
                <Image
                  src={msg.image}
                  alt={msg.message}
                  width={320}
                  height={320}
                  className="max-w-xs"
                />
              )}
            </div>
          ) : (
            <div key={msg.id}>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-small font-medium leading-none">
                    {msg.username}
                  </span>
                  <span className="text-tiny text-white/40 leading-none">
                    {formatTimestamp(msg.created_at)}
                  </span>
                </div>
                <p className="text-tiny mt-1 break-words leading-snug">
                  {msg.message}
                </p>
              </div>
            </div>
          )
        )}
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-white">
        {!showNameForm && (
          <>
            <div className="flex gap-2 items-center p-3">
              <input
                ref={inputRef}
                type="text"
                placeholder="Say something..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={500}
                disabled={sending}
                className="flex-1 bg-black border border-white rounded-full text-white text-tiny px-4 py-2 focus:outline-none focus:border-white/50 placeholder-white/30 min-w-0 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="flex-shrink-0 border border-white rounded-full text-tiny px-4 py-2 hover:bg-white hover:text-black transition-colors disabled:opacity-40"
              >
                Send
              </button>
            </div>
            <div className="flex items-center justify-end gap-1 px-3 pb-3">
              <span className="text-white text-tiny">
                Chatting as <strong className="text-white">{username}</strong>
              </span>
              <button
                onClick={handleResetUsername}
                className="text-white text-tiny underline hover:text-white/60 transition-colors ml-1"
              >
                change
              </button>
            </div>
          </>
        )}

        {showNameForm && (
          <div className="p-3 space-y-2">
            <p className="text-tiny text-white">
              {username ? "Change username" : "Choose a username to chat"}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Username"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={handleNameKeyDown}
                maxLength={30}
                autoFocus
                className="flex-1 bg-white/10 border border-white/20 rounded-full text-white text-tiny px-4 py-2 focus:outline-none focus:border-white/50 placeholder-white/30 min-w-0"
              />
              <button
                onClick={handleSetUsername}
                disabled={nameInput.trim().length < 2}
                className="flex-shrink-0 border border-white/40 rounded-full text-tiny px-4 py-2 hover:bg-white hover:text-black transition-colors disabled:opacity-40"
              >
                {username ? "Save" : "Join"}
              </button>
              {username && (
                <button
                  onClick={() => {
                    setSettingName(false);
                    setNameInput("");
                  }}
                  className="flex-shrink-0 text-white text-tiny hover:text-white transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
