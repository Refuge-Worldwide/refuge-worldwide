import { newRidgeState } from "react-ridge-state";
import { WidgetInterface } from "../next-env";

const mixcloudPlayer = newRidgeState<WidgetInterface>(null);

export default function useMixcloudPlayer() {
  return mixcloudPlayer.use();
}

const mixcloudShowKey = newRidgeState<string>(null);

export function useMixcloudShowKey() {
  return mixcloudShowKey.use();
}
