import Image from "next/image";
import Link from "next/link";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createChatRealtimeClient } from "@/lib/directus/chatRealtime";
import { useDirectusUser } from "@/hooks/useDirectusUser";
import { splitOnUrls, isUrl } from "@/lib/linkify";
import { ensureHttps } from "@/util";
import { IoCameraOutline } from "react-icons/io5";

const LS_USERNAME = "rw_chat_username";
// photos only show inline, and this keeps uploads small (~100-200KB)
const MAX_UPLOAD_DIMENSION = 1024;
// matches MAX_CHAT_IMAGE_BYTES in lib/chatImages.ts
const MAX_UPLOAD_BYTES = 1024 * 1024;
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
  is_system: boolean;
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
    const isSystem = msg.is_system === true;
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

async function decodeImage(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // Only Safari can read iPhone HEIC photos, so convert them for everyone
    // else. Loaded on demand, it's a few MB.
    const { heicTo, isHeic } = await import("heic-to");
    if (!(await isHeic(file))) throw new Error("Unsupported image");
    return heicTo({ blob: file, type: "bitmap" });
  }
}

// Every photo is shrunk to a small JPEG here before upload, which also drops
// its EXIF (including GPS). The server only accepts JPEGs.
async function shrinkImage(file: File): Promise<Blob | null> {
  try {
    const bitmap = await decodeImage(file);
    const scale = Math.min(
      1,
      MAX_UPLOAD_DIMENSION / Math.max(bitmap.width, bitmap.height)
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas
      .getContext("2d")
      ?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.7)
    );
  } catch (error) {
    console.error("Error reading photo:", error);
    return null;
  }
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
  const {
    user: accountUser,
    loading: accountLoading,
    isStaff,
  } = useDirectusUser();
  const isLoggedIn = Boolean(accountUser);
  const accountDisplayName = accountUser
    ? accountUser.first_name?.trim() || accountUser.email.split("@")[0]
    : null;

  const [username, setUsername] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [settingName, setSettingName] = useState(false);
  const [ready, setReady] = useState(false);

  const displayName = isLoggedIn ? accountDisplayName : username;
  const showNameForm = !isLoggedIn && (!username || settingName);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [listReady, setListReady] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<{
    blob: Blob;
    previewUrl: string;
  } | null>(null);
  // HEIC conversion can take a second or two
  const [preparingImage, setPreparingImage] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadingMoreRef = useRef(false);
  // Mirrors `messages` so handleScroll (attached once) can always read the
  // current oldest-loaded id without needing to be re-bound on every change.
  const messagesRef = useRef<ChatMessage[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const isNearBottomRef = useRef(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  // Appends messages (deduped by id against what's already loaded), and
  // auto-scrolls to the bottom only if the viewer was already there — so a
  // new message doesn't yank someone away from history they scrolled up to
  // read.
  const appendMessages = useCallback(
    (incoming: ChatMessage[]) => {
      const wasNearBottom = isNearBottomRef.current;

      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const toAdd = incoming.filter((m) => !existingIds.has(m.id));
        return toAdd.length ? [...prev, ...toAdd] : prev;
      });

      if (wasNearBottom) {
        requestAnimationFrame(() => scrollToBottom());
      }
    },
    [scrollToBottom]
  );

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
          scrollToBottom();
          setTimeout(() => {
            if (!cancelled) setListReady(true);
          }, 250);
        });
      })
      .catch((error) => {
        console.error("Error fetching chat messages:", error);
        if (!cancelled) {
          setLoadingMessages(false);
          setListReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [scrollToBottom]);

  // Load the next page of older messages, preserving where the viewer was
  // looking (prepending content above the viewport would otherwise shove
  // everything down by the new content's height). An emptier-than-requested
  // page means there's nothing older left.
  const loadOlderMessages = useCallback(async () => {
    const oldest = messagesRef.current[0];
    if (loadingMoreRef.current || !hasMoreHistory || !oldest) return;

    const el = listRef.current;
    const prevScrollHeight = el?.scrollHeight ?? 0;
    const prevScrollTop = el?.scrollTop ?? 0;
    loadingMoreRef.current = true;

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
      loadingMoreRef.current = false;
    }
  }, [hasMoreHistory]);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;

    isNearBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_THRESHOLD;

    if (el.scrollTop <= LOAD_MORE_THRESHOLD) loadOlderMessages();
  }, [loadOlderMessages]);

  // Subscribe to realtime updates. This Directus instance's websocket layer
  // requires every connection to authenticate (WEBSOCKETS_REST_AUTH
  // defaults to "handshake" — there's no anonymous mode enabled), so we
  // authenticate as a dedicated read-only user rather than connecting
  // anonymously — see lib/directus/chatRealtime.ts.
  const clientRef = useRef<Awaited<
    ReturnType<typeof createChatRealtimeClient>
  > | null>(null);
  const cancelledRef = useRef(false);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  useEffect(() => {
    cancelledRef.current = false;

    const listen = async (attempt: number) => {
      if (cancelledRef.current) return;

      try {
        const client = await createChatRealtimeClient();
        clientRef.current = client;
        if (cancelledRef.current) return;

        const { subscription } = await client.subscribe("chat", {});

        for await (const event of subscription) {
          if (cancelledRef.current) break;

          if (event.event === "create") {
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

      if (!cancelledRef.current) {
        const delay = Math.min(30000, 1000 * 2 ** attempt);
        retryTimeoutRef.current = setTimeout(() => listen(attempt + 1), delay);
      }
    };

    listen(0);

    return () => {
      cancelledRef.current = true;
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      clientRef.current?.disconnect();
      clientRef.current = null;
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

  const clearPendingImage = useCallback(() => {
    setPendingImage((prev) => {
      if (prev) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handlePickImage = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setSendError(null);
      setPreparingImage(true);
      const blob = await shrinkImage(file);
      setPreparingImage(false);
      if (!blob) {
        setSendError("Couldn't read that photo, try a JPEG or PNG.");
        return;
      }
      if (blob.size > MAX_UPLOAD_BYTES) {
        setSendError("That photo is too large.");
        return;
      }
      setPendingImage((prev) => {
        if (prev) URL.revokeObjectURL(prev.previewUrl);
        return { blob, previewUrl: URL.createObjectURL(blob) };
      });
      inputRef.current?.focus();
    },
    []
  );

  const handleSend = useCallback(async () => {
    if (
      !displayName ||
      (!input.trim() && !pendingImage) ||
      sending ||
      preparingImage
    )
      return;
    const text = input.trim().slice(0, 500);
    setSending(true);
    setSendError(null);
    try {
      let response: Response;
      if (pendingImage) {
        // Photos only go up as part of a message (see pages/api/chat/send.ts)
        const form = new FormData();
        form.append("message", text);
        if (!isLoggedIn) form.append("username", displayName);
        form.append("image", pendingImage.blob, "photo.jpg");
        response = await fetch("/api/chat/send", {
          method: "POST",
          body: form,
        });
      } else {
        response = await fetch("/api/chat/send", {
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
      }
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        setSendError(body?.error ?? "Failed to send message");
      } else {
        setInput("");
        clearPendingImage();
      }
      if (response.ok && body?.message) {
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
  }, [
    displayName,
    isLoggedIn,
    input,
    pendingImage,
    sending,
    preparingImage,
    appendMessages,
    clearPendingImage,
  ]);

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
      <div className="relative flex-1 min-h-0">
        {!listReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div
              className="h-6 w-6 rounded-full border-2 border-white/20 border-t-white animate-spin"
              role="status"
              aria-label="Loading chat"
            />
          </div>
        )}
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="chat-scrollbar h-full overflow-y-auto p-3 space-y-3"
          style={{ visibility: listReady ? "visible" : "hidden" }}
        >
          {!loadingMessages && messages.length === 0 && (
            <p className="text-white text-small text-center pt-6">
              No messages yet. Say hi!
            </p>
          )}
          {messageGroups.map((group) =>
            group.system ? (
              <div key={group.key} className="py-2 space-y-2 min-w-0">
                <div className="h-px bg-white/20" />
                <p className="text-small text-white/50 break-words min-w-0">
                  Live now: {group.messages[0].message}
                </p>
                {group.image && (
                  <Image
                    src={ensureHttps(group.image)}
                    alt={group.messages[0].message}
                    width={640}
                    height={360}
                    className="w-full max-w-xs aspect-video object-cover"
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
                      <div className="flex-1 min-w-0">
                        {msg.message && (
                          <p className="text-tiny break-words leading-snug">
                            {splitOnUrls(msg.message).map((part, i) =>
                              isUrl(part) ? (
                                <a
                                  key={i}
                                  href={part}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline"
                                >
                                  {part}
                                </a>
                              ) : (
                                part
                              )
                            )}
                          </p>
                        )}
                        {msg.image && (
                          // plain img, these are already small and served from Directus
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={msg.image}
                            alt={`Photo from ${msg.username}`}
                            loading="lazy"
                            onLoad={() => {
                              if (isNearBottomRef.current) scrollToBottom();
                            }}
                            className="mt-1 max-w-[65%] max-h-80 object-cover bg-white/10"
                          />
                        )}
                      </div>
                      {isStaff && (
                        <button
                          onClick={() =>
                            handleDeleteMessage(
                              msg.id,
                              msg.message || "(photo)"
                            )
                          }
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
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-white">
        {!showNameForm && (
          <>
            {pendingImage && (
              <div className="relative ml-3 mt-3 w-fit max-w-[65%]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pendingImage.previewUrl}
                  alt="Photo to send"
                  className="block max-h-40 max-w-full w-auto"
                />
                <button
                  onClick={clearPendingImage}
                  disabled={sending}
                  aria-label="Remove photo"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-white text-black text-tiny leading-none flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            )}
            {/* a real form, so Enter sends without a send button (implicit submission) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2 items-center p-3"
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Say something..."
                enterKeyHint="send"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={500}
                // readOnly rather than disabled, so focus stays put for the next message
                readOnly={sending}
                className="flex-1 bg-black border border-white rounded-full text-white text-tiny px-4 py-2 focus:outline-none focus:border-white/50 placeholder-white/30 min-w-0 read-only:opacity-50"
              />
              <input
                ref={fileInputRef}
                type="file"
                // .heic listed too, desktop Chrome doesn't count it as image/*
                accept="image/*,.heic,.heif"
                onChange={handlePickImage}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending || preparingImage}
                aria-label="Add a photo"
                className="flex-shrink-0 p-2 text-white/70 hover:text-white transition-colors disabled:opacity-40"
              >
                {preparingImage ? (
                  <span
                    className="block h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin"
                    role="status"
                    aria-label="Preparing photo"
                  />
                ) : (
                  <IoCameraOutline size={18} />
                )}
              </button>
            </form>
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
