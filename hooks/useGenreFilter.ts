import { useState } from "react";

export default function useGenreFilter() {
  const [filter, filterSet] = useState<string>("All");

  return { filter, filterSet };
}
