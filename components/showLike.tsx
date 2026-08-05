import { IoHeart } from "react-icons/io5";
import HeartOutline from "../icons/heartOutline";
import { useState } from "react";
import useSWR from "swr";
import { LikeSignInModal } from "./likeSignInModal";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ShowLike({ id }: { id?: string }) {
  const { data, mutate } = useSWR<{ ids: string[] }>(
    "/api/user/likes/ids",
    fetcher
  );
  const [isToggling, setIsToggling] = useState(false);
  const [signInModalOpen, setSignInModalOpen] = useState(false);
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
        setSignInModalOpen(true);
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
    <>
      <button type="button" onClick={toggleLike} disabled={isToggling}>
        {liked ? (
          <IoHeart
            className="w-8 h-8 sm:w-10 sm:h-10"
            aria-label="Unlike show"
          />
        ) : (
          <HeartOutline
            className="w-8 h-8 sm:w-10 sm:h-10"
            strokeWidth={24}
            aria-label="Like show"
          />
        )}
      </button>
      <LikeSignInModal
        open={signInModalOpen}
        onOpenChange={setSignInModalOpen}
      />
    </>
  );
}
