import Link from "next/link";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/component";
import { useState } from "react";
import { useEffect } from "react";
import { Button } from "@react-email/components";

export default function ShowLike({ id }: { id?: string }) {
  const pathname = usePathname();
  const supabase = createClient();
  const [user, setUser] = useState();
  const [liked, setLiked] = useState(null);

  useEffect(() => {
    // check if we are logged in
    // if we are logged in then set user and check if we have already liked this show
    supabase.auth.getUser().then((data) => {
      if (data.data.user) {
        console.log(data.data.user.id);
        setUser(data.data.user);
        checkIfLiked(data.data.user.id);
      }
    });
  }, []);

  async function checkIfLiked(userId: string) {
    try {
      const { data, error } = await supabase
        .from("showLikes")
        .select("id")
        .eq("user_id", userId)
        .eq("show_id", id)
        .maybeSingle();
      if (error) console.log(error);
      console.log(data);
      if (data) {
        setLiked(data.id);
      }
    } catch (error) {
      alert(error);
    }
  }

  async function toggleLike() {
    if (!liked) {
      setLiked(true);
      try {
        const { data, error } = await supabase
          .from("showLikes")
          .insert({ user_id: user.id, show_id: id });
        if (error) throw error;
        console.log("Like added!");
      } catch (error) {
        setLiked(false);
        console.log(error);
      }
    } else {
      setLiked(false);
      try {
        const { data, error } = await supabase
          .from("showLikes")
          .delete()
          .eq("user_id", user.id)
          .eq("show_id", id);
        if (error) throw error;
        console.log("Like removed!");
      } catch (error) {
        setLiked(true);
        console.log(error);
      }
    }
  }

  return (
    <Button
      onClick={() => toggleLike()}
      // className={`absolute ${pathname == "/" ? "mt-[58px] sm:mt-28 " : "mt-4"
      //   } right-6 rounded-full border border-black bg-white p-3 shadow-md z-10`}
    >
      {liked ? (
        <AiFillHeart size={40} aria-label="Like show" />
      ) : (
        <AiOutlineHeart size={40} aria-label="Like show" />
      )}
    </Button>
  );
}
