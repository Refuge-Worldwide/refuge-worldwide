import { useRouter } from "next/router";
import { createClient } from "@/lib/supabase/component";
import { useState, useEffect } from "react";

export default function SignOut() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState();

  useEffect(() => {
    supabase.auth.getUser().then((user) => {
      setUser(user.data);
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.reload();
  };

  if (user)
    return (
      <button className="text-left grow-0" onClick={handleSignOut}>
        Sign out
      </button>
    );
}
