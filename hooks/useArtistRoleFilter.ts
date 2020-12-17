import { useState } from "react";

export default function useArtistRoleFilter<T = any>(initialFilter: T) {
  const [filter, filterSet] = useState<T>(initialFilter);

  return { filter, filterSet };
}
