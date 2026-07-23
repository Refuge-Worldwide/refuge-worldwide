import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ShowLike({ id }: { id?: string }) {
  const { data, mutate } = useSWR<{ ids: string[] }>(
    "/api/user/likes/ids",
    fetcher
  );
  const [isToggling, setIsToggling] = useState(false);
  const liked = !!id && !!data?.ids?.includes(id);

  async function toggleLike() {
    if (!id || isToggling) return;
    setIsToggling(true);

    try {
      const res = await fetch("/api/user/likes/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showId: id }),
      });

      if (res.status === 401) {
        alert("Sign in to like shows");
        return;
      }
      if (!res.ok) throw new Error("Failed to update like");

      await mutate();
    } catch (error) {
      console.error(error);
    } finally {
      setIsToggling(false);
    }
  }

  return (
    <button type="button" onClick={toggleLike} disabled={isToggling}>
      {liked ? (
        <AiFillHeart
          className="w-12 h-12 sm:w-16 sm:h-16"
          aria-label="Unlike show"
        />
      ) : (
        <AiOutlineHeart
          className="w-12 h-12 sm:w-16 sm:h-16"
          aria-label="Like show"
        />
      )}
    </button>
  );
}
