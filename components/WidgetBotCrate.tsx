"use client";

import Options from "@widgetbot/crate/dist/types/options";
import React from "react";

export default function WidgetBotCrate(props: Options) {
  React.useEffect(() => {
    async function loadCrate(props: Options) {
      const res = await import("@widgetbot/crate");
      const Crate = await res.cdn();

      new Crate(props);
    }

    loadCrate(props);
  }, []);
  return <></>;
}
