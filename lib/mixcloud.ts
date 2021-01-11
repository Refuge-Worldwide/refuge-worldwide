import { newRidgeState } from "react-ridge-state";
import { PlayerWidget } from "../types/mixcloud";

export const showKey = newRidgeState<string>(null);

export const playerWidget = newRidgeState<PlayerWidget>(null);
