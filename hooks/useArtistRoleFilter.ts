import { useState } from "react";
import type { ArtistFilterType } from "../types/shared";

export default function useArtistRoleFilter(initialFilter: ArtistFilterType) {
  const [filter, filterSet] = useState<ArtistFilterType>(initialFilter);

  return { filter, filterSet };
}
