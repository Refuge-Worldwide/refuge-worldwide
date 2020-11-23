import { useEffect } from "react";
import useScript from "./useScript";

/**
 * @summary This hook is still based on an experimental API from Mixcloud, it doesn't seem to be working properly here, might be due to the face its messing with pushstate parts of the browser
 *
 * @external https://www.mixcloud.com/developers/widget/
 */
export default function useMixcloudFooterWidget() {
  const status = useScript(
    "https://widget.mixcloud.com/media/js/footerWidgetApi.js"
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

      promise?.then((widget) => console.log(widget));
    }
  }, [status]);
}
