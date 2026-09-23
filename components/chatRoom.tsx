import Image from "next/image";
import Link from "next/link";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createChatRealtimeClient } from "@/lib/directus/chatRealtime";
import { useDirectusUser } from "@/hooks/useDirectusUser";

const LS_USERNAME = "rw_chat_username";
const PAGE_SIZE = 50;
// How close to the top (px) triggers loading older messages.
const LOAD_MORE_THRESHOLD = 100;
// How close to the bottom (px) counts as "already at the bottom", so a new
// message auto-scrolls into view without yanking someone reading history.
const NEAR_BOTTOM_THRESHOLD = 80;

interface ChatMessage {
  id: number;
  user: string | null;
  username: string;
  message: string;
  image: string | null;
  date_created: string;
}

interface MessageGroup {
  key: string;
  system: boolean;
  username: string;
  date_created: string;
  image: string | null;
  messages: ChatMessage[];
}

// Truncates to the minute (dropping seconds/ms) so grouping can compare
// "same calendar minute" rather than a rolling time-since-last-message window.
function toMinute(ts: string): number {
  return Math.floor(new Date(ts).getTime() / 60000);
}

function groupMessages(messages: ChatMessage[]): MessageGroup[] {
  const groups: MessageGroup[] = [];

  for (const msg of messages) {
    const isSystem = msg.username === "Refuge Worldwide";
    const last = groups[groups.length - 1];
    const lastMessage = last?.messages[last.messages.length - 1];
    const sameSender =
      last &&
      lastMessage &&
      !isSystem &&
      !last.system &&
      last.username === msg.username &&
      toMinute(msg.date_created) === toMinute(lastMessage.date_created);

    if (sameSender && last) {
      last.messages.push(msg);
    } else {
      groups.push({
        key: String(msg.id),
        system: isSystem,
        username: msg.username,
        date_created: msg.date_created,
        image: msg.image,
        messages: [msg],
      });
    }
  }

  return groups;
}

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) return time;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}, ${time}`;
}

const ChatRoom: FC = () => {
  // Signed-in senders chat as their account name (the same "Username" field
  // shown in Account Settings, stored on Directus's first_name) — no
  // separate identity to pick. Anonymous visitors still choose one, kept in
  // localStorage.
  const { user: accountUser, loading: accountLoading } = useDirectusUser();
  const isLoggedIn = Boolean(accountUser);
  const accountDisplayName = accountUser
    ? accountUser.first_name?.trim() || accountUser.email.split("@")[0]
    : null;

  const [isStaff, setIsStaff] = useState(false);
  useEffect(() => {
    if (!isLoggedIn) {
      setIsStaff(false);
      return;
    }
    let cancelled = false;
    fetch("/api/auth/is-staff")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setIsStaff(!!data.isStaff);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  const [username, setUsername] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [settingName, setSettingName] = useState(false);
  const [ready, setReady] = useState(false);

  const displayName = isLoggedIn ? accountDisplayName : username;
  const showNameForm = !isLoggedIn && (!username || settingName);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Mirrors `messages` so handleScroll (attached once) can always read the
  // current oldest-loaded id without needing to be re-bound on every change.
  const messagesRef = useRef<ChatMessage[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Appends messages (deduped by id against what's already loaded), and
  // auto-scrolls to the bottom only if the viewer was already there — so a
  // new message doesn't yank someone away from history they scrolled up to
  // read.
  const appendMessages = useCallback((incoming: ChatMessage[]) => {
    const el = listRef.current;
    const wasNearBottom = el
      ? el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_THRESHOLD
      : true;

    setMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const toAdd = incoming.filter((m) => !existingIds.has(m.id));
      return toAdd.length ? [...prev, ...toAdd] : prev;
    });

    if (wasNearBottom) {
      requestAnimationFrame(() => {
        if (listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight;
        }
      });
    }
  }, []);

  // Load identity from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(LS_USERNAME);
    if (stored) setUsername(stored);
    setReady(true);
  }, []);

  // Load the most recent page of messages via /api/chat/history — a thin
  // relay to Directus's own REST query params (see that file for why: CORS).
  // Newest-first off the wire, reversed here for oldest-first display.
  useEffect(() => {
    let cancelled = false;

    fetch(`/api/chat/history?sort=-id&limit=${PAGE_SIZE}`)
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok)
          throw new Error(
            data?.errors?.[0]?.message ?? "Failed to load chat history"
          );
        const rows = (data.data as ChatMessage[]).reverse();
        setMessages(rows);
        setHasMoreHistory(rows.length === PAGE_SIZE);
        setLoadingMessages(false);
        requestAnimationFrame(() => {
          if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
          }
        });
      })
      .catch((error) => {
        console.error("Error fetching chat messages:", error);
        if (!cancelled) setLoadingMessages(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Load the next page of older messages, preserving where the viewer was
  // looking (prepending content above the viewport would otherwise shove
  // everything down by the new content's height). An emptier-than-requested
  // page means there's nothing older left.
  const loadOlderMessages = useCallback(async () => {
    const oldest = messagesRef.current[0];
    if (loadingMore || !hasMoreHistory || !oldest) return;

    const el = listRef.current;
    const prevScrollHeight = el?.scrollHeight ?? 0;
    const prevScrollTop = el?.scrollTop ?? 0;
    setLoadingMore(true);

    try {
      const res = await fetch(
        `/api/chat/history?sort=-id&limit=${PAGE_SIZE}&filter[id][_lt]=${oldest.id}`
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.errors?.[0]?.message ?? "Failed to load history");
      }

      const older = (data.data as ChatMessage[]).reverse();
      if (older.length > 0) {
        setMessages((prev) => [...older, ...prev]);
      }
      setHasMoreHistory(older.length === PAGE_SIZE);

      requestAnimationFrame(() => {
        if (listRef.current) {
          const newScrollHeight = listRef.current.scrollHeight;
          listRef.current.scrollTop =
            prevScrollTop + (newScrollHeight - prevScrollHeight);
        }
      });
    } catch (error) {
      console.error("Error loading older chat messages:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMoreHistory]);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || el.scrollTop > LOAD_MORE_THRESHOLD) return;
    loadOlderMessages();
  }, [loadOlderMessages]);

  // Subscribe to realtime updates. This Directus instance's websocket layer
  // requires every connection to authenticate (WEBSOCKETS_REST_AUTH
  // defaults to "handshake" — there's no anonymous mode enabled), so we
  // authenticate as a dedicated read-only user rather than connecting
  // anonymously — see lib/directus/chatRealtime.ts.
  useEffect(() => {
    let cancelled = false;
    let client: Awaited<ReturnType<typeof createChatRealtimeClient>> | null =
      null;

    const listen = async () => {
      try {
        client = await createChatRealtimeClient();
        if (cancelled) return;

        // No `event` filter — this subscribes to create, update and delete
        // alike, so a staff deletion (see handleDeleteMessage) propagates to
        // every connected viewer, not just the one who deleted it.
        const { subscription } = await client.subscribe("chat", {});

        for await (const event of subscription) {
          if (cancelled) break;

          if (event.event === "create") {
            // appendMessages dedupes by id, so this can't double up with the
            // optimistic append already done in handleSend for our own sends.
            appendMessages(event.data as unknown as ChatMessage[]);
          } else if (event.event === "delete") {
            const deletedIds = new Set(
              (event.data as (string | number)[]).map(Number)
            );
            setMessages((prev) => prev.filter((m) => !deletedIds.has(m.id)));
          }
        }
      } catch (error) {
        console.error("Error subscribing to chat:", error);
      }
    };

    listen();

    return () => {
      cancelled = true;
      client?.disconnect();
    };
  }, [appendMessages]);

  // Focus input once there's a name to chat under
  useEffect(() => {
    if (displayName && !showNameForm && inputRef.current) {
      inputRef.current.focus();
    }
  }, [displayName, showNameForm]);

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
    if (!displayName || !input.trim() || sending) return;
    const text = input.trim().slice(0, 500);
    setInput("");
    setSending(true);
    setSendError(null);
    try {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Signed-in senders' identity is resolved server-side from the
        // session cookie — sending a username here would just be ignored,
        // so it's only included for anonymous senders.
        body: JSON.stringify({
          message: text,
          ...(isLoggedIn ? {} : { username: displayName }),
        }),
      });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        setSendError(body?.error ?? "Failed to send message");
      } else if (body?.message) {
        // Show it immediately rather than waiting for the realtime event to
        // round-trip — appendMessages dedupes by id, so it can't double up
        // when that event arrives too.
        appendMessages([body.message as ChatMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setSendError("Failed to send message");
    } finally {
      setTimeout(() => setSending(false), 1000);
    }
  }, [displayName, isLoggedIn, input, sending, appendMessages]);

  const messageGroups = useMemo(() => groupMessages(messages), [messages]);

  const handleDeleteMessage = useCallback(async (id: number, text: string) => {
    if (!window.confirm(`Delete this message?\n\n"${text}"`)) return;
    // Removed locally right away rather than waiting on the realtime delete
    // event to round-trip back (same reasoning as appendMessages in
    // handleSend); other viewers still get it via that event.
    setMessages((prev) => prev.filter((m) => m.id !== id));
    try {
      const response = await fetch("/api/chat/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        console.error("Failed to delete message:", await response.text());
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  }, []);

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

  if (!ready || accountLoading) return null;

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
        {messageGroups.map((group) =>
          group.system ? (
            <div key={group.key} className="py-2 space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/20" />
                <span className="text-tiny text-white/50 flex-shrink-0">
                  Live now: {group.messages[0].message}
                </span>
                <div className="flex-1 h-px bg-white/20" />
              </div>
              {group.image && (
                <Image
                  src={group.image}
                  alt={group.messages[0].message}
                  width={320}
                  height={320}
                  className="max-w-xs"
                />
              )}
            </div>
          ) : (
            <div key={group.key} className="min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-tiny font-medium leading-none">
                  {group.username}
                </span>
                <span className="text-tiny text-white/40 leading-none">
                  {formatTimestamp(group.date_created)}
                </span>
              </div>
              <div className="mt-1 space-y-px">
                {group.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="group/msg flex items-start gap-2 -mx-1.5 px-1.5 py-0.5 rounded hover:bg-white/10"
                  >
                    <p className="text-tiny break-words leading-snug flex-1">
                      {msg.message}
                    </p>
                    {isStaff && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id, msg.message)}
                        className="text-tiny text-red-400 underline opacity-0 group-hover/msg:opacity-100 transition-opacity flex-shrink-0"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
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
            {sendError && (
              <p className="text-tiny text-red-400 px-3 pb-1">{sendError}</p>
            )}
            <div className="flex items-center justify-end gap-1 px-3 pb-3">
              <span className="text-white text-tiny">
                Chatting as{" "}
                <strong className="text-white">{displayName}</strong>
              </span>
              {isLoggedIn ? (
                <Link
                  href="/account/settings"
                  className="text-white text-tiny underline hover:text-white/60 transition-colors ml-1"
                >
                  change
                </Link>
              ) : (
                <button
                  onClick={handleResetUsername}
                  className="text-white text-tiny underline hover:text-white/60 transition-colors ml-1"
                >
                  change
                </button>
              )}
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
