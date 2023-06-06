import WidgetBot from "@widgetbot/react-embed";
import { useState } from "react";
import { useEffect } from "react";
import {
  DISCORD_SERVER_ID,
  DISCORD_CHANNEL_ID,
  DISCORD_INVITE_URL,
} from "../constants";

export default function DiscordEmbed() {
  const [window, setWindow] = useState<boolean>(false);
  const avatars = [
    "https://refugeworldwide.com/images/chat-avatar.png",
    "https://refugeworldwide.com/images/chat-avatar_1.png",
    "https://refugeworldwide.com/images/chat-avatar_2.png",
    "https://refugeworldwide.com/images/chat-avatar_3.png",
    "https://refugeworldwide.com/images/chat-avatar_6.png",
    "https://refugeworldwide.com/images/chat-avatar_7.png",
    "https://refugeworldwide.com/images/chat-avatar_8.png",
    "https://refugeworldwide.com/images/chat-avatar_9.png",
    "https://refugeworldwide.com/images/chat-avatar_10.png",
    "https://refugeworldwide.com/images/chat-avatar_11.png",
  ];

  const avatar = avatars[Math.floor(Math.random() * avatars.length)];

  console.log(avatar);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindow(true);
    }
  }, []);

  if (window) {
    return (
      <WidgetBot
        className="h-full w-full"
        server={DISCORD_SERVER_ID}
        channel={DISCORD_CHANNEL_ID}
        avatar={avatar}
      />
    );
  }
}
