import { IoHeart } from "react-icons/io5";
import HeartOutline from "../icons/heartOutline";
import { useState } from "react";
import useSWR from "swr";
import { FavouriteSignInModal } from "./favouriteSignInModal";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ShowFavourite({ id }: { id?: string }) {
  const { data, mutate } = useSWR<{ ids: string[] }>(
    "/api/user/favourites/ids",
    fetcher
  );
  const [isToggling, setIsToggling] = useState(false);
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const favourited = !!id && !!data?.ids?.includes(id);

  async function toggleFavourite() {
    if (!id || isToggling) return;
    setIsToggling(true);

    try {
      const res = await fetch("/api/user/favourites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showId: id }),
      });

      if (res.status === 401 || res.status === 403) {
        setSignInModalOpen(true);
        return;
      }
      if (!res.ok) throw new Error("Failed to update favourite");

      await mutate();
    } catch (error) {
      console.error(error);
    } finally {
      setIsToggling(false);
    }
  }

  return (
    <>
      <button type="button" onClick={toggleFavourite} disabled={isToggling}>
        {favourited ? (
          <IoHeart
            className="w-8 h-8 sm:w-10 sm:h-10"
            aria-label="Remove from favourites"
          />
        ) : (
          <HeartOutline
            className="w-8 h-8 sm:w-10 sm:h-10"
            strokeWidth={24}
            aria-label="Add to favourites"
          />
        )}
      </button>
      <FavouriteSignInModal
        open={signInModalOpen}
        onOpenChange={setSignInModalOpen}
      />
    </>
  );
}
