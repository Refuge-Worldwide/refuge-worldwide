import { newRidgeState } from "react-ridge-state";
import { PlayerWidget } from "../types/shared";

export const showKey = newRidgeState<string>(null);

export const playerWidget = newRidgeState<PlayerWidget>(null);
