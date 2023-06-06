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
    "https://images.ctfassets.net/taoiy3h84mql/HD6ovuxiMGWFse3NGBmmj/dd8de8bfe69329472de46b0783e3cfa3/chatroom-avatar-1.png?h=250",
    "https://images.ctfassets.net/taoiy3h84mql/7G8m3Usz71tzORSn8Z9lwC/d2d35f6eff19f7c6e6cb93232e47902d/chatroom-avatar-2.png?h=250",
    "https://images.ctfassets.net/taoiy3h84mql/5bnmpZukdud44N58uWGoec/9b2bd26355ec0299304d2fed237952c0/chatroom-avatar-3.png?h=250",
    "https://images.ctfassets.net/taoiy3h84mql/cUBSdUfEp1Kpa4cyPNmpy/dd5cdfb297dc50e286478f9b63564649/chatroom-avatar-4.png?h=250",
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
