import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";

export default function SignOut() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.reload();
  };
  return (
    <button className="text-left grow-0" onClick={handleSignOut}>
      Sign out
    </button>
  );
}
