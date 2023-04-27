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
      />
    );
  }
}
