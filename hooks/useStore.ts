import { create } from "zustand";
import Cookies from "js-cookie";

export enum ActivePlayer {
  CH1,
  CH2,
  MIXCLOUD,
  SOUNDCLOUD,
  YOUTUBE,
}

interface GlobalStore {
  activePlayer: ActivePlayer | undefined;
  activePlayerSet: (activePlayer: ActivePlayer) => void;

  showUrl: string | undefined;
  showImage: string | undefined;
  showPageUrl: string | undefined;
  showUrlSet: (
    showUrl: string,
    showImage?: string,
    showPageUrl?: string
  ) => void;
}

export const useGlobalStore = create<GlobalStore>()((set) => ({
  activePlayer: undefined,
  activePlayerSet: (activePlayer) => set({ activePlayer }),

  showUrl: undefined,
  showImage: undefined,
  showPageUrl: undefined,
  showUrlSet: (showUrl, showImage, showPageUrl) =>
    set({
      activePlayer: archivePlayerType(showUrl),
      showUrl,
      showImage,
      showPageUrl,
    }),
}));

const archivePlayerType = (showUrl) => {
  if (showUrl.includes("soundcloud")) {
    return ActivePlayer.SOUNDCLOUD;
  }
  if (showUrl.includes("youtube")) {
    return ActivePlayer.YOUTUBE;
  }
  return ActivePlayer.MIXCLOUD;
};
