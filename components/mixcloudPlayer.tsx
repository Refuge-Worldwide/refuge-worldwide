import { useEffect, useRef } from "react";
import useScript from "../hooks/useScript";

export default function MixcloudPlayer() {
  const playerRef = useRef(null);

  const status = useScript("//widget.mixcloud.com/media/js/widgetApi.js");

  useEffect(() => {
    if (status === "ready") {
      document.getElementById("my-widget-iframe");
      const widget = window?.Mixcloud.PlayerWidget(playerRef.current);

      widget.ready.then(function () {
        console.log(widget);
      });
    }
  }, [status]);

  if (status === "ready") return <iframe ref={playerRef} />;

  return null;
}
