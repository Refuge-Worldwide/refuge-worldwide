"use client";

import WidgetBot, { Props as EmbedProps } from "@widgetbot/react-embed";

export default function WidgetBotEmbed(props: EmbedProps) {
  return <WidgetBot {...props}></WidgetBot>;
}
