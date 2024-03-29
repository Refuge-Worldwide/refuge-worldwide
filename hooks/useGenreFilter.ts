import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function useGenreFilter() {
  const router = useRouter();

  const params = router.query as typeof router.query & {
    genre?: string[];
  };

  const [filter, filterSet] = useState<string[]>([]);

  useEffect(() => {
    if (typeof params?.genre === "string") {
      filterSet([params.genre]);
    } else {
      filterSet([]);
    }
  }, [params]);

  return { filter, filterSet };
}
