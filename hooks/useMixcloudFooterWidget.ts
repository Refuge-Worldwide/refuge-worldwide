import { useEffect } from "react";
import useScript from "./useScript";

export default function useMixcloudFooterWidget() {
  const isClient = typeof window !== "undefined";

  const status = useScript(
    isClient
      ? "https://widget.mixcloud.com/media/js/footerWidgetApi.js"
      : undefined
  );

  useEffect(() => {
    if (status === "ready") {
      const promise = window?.Mixcloud?.FooterWidget(
        "RefugeWorldwide/d-tiffany-refuge-worldwide-october-2020/",
        {
          disablePushstate: true,
          disableUnloadWarning: true,
        }
      );

      promise?.then(function (widget) {
        console.log(widget);
      });
    }
  }, [status]);
}
