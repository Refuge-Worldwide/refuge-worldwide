import { useState } from "react";

export default function useArtistRoleFilter<T = any>() {
  const [filter, filterSet] = useState<T>();

  return { filter, filterSet };
}
