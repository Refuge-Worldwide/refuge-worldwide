import { useEffect } from "react";
import useMixcloudPlayer from "../hooks/useMixcloudPlayer";
import useScript from "../hooks/useScript";

export default function MixcloudPlayer() {
  const [player, setPlayer] = useMixcloudPlayer();

  const status = useScript("//widget.mixcloud.com/media/js/widgetApi.js");

  useEffect(() => {
    async function handleMixcloudPlayer() {
      const elem = document.getElementById("mixcloud");

      let widget = window?.Mixcloud?.PlayerWidget(elem);

      widget.ready.then(() => {
        console.log("Mixcloud PlayerWidget Ready");

        if (!player) {
          setPlayer(widget);
        }
      });
    }

    if (status === "ready") handleMixcloudPlayer();
  }, [status]);

  return (
    <iframe
      className="fixed bottom-0 left-0"
      height={120}
      id="mixcloud"
      src="https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=0&feed=%2FRefugeWorldwide%2Fd-tiffany-refuge-worldwide-october-2020%2F"
      width="50%"
    />
  );
}
