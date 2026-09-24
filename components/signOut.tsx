import { useRouter } from "next/router";
import { useDirectusUser } from "@/hooks/useDirectusUser";

export default function SignOut() {
  const router = useRouter();
  const { user } = useDirectusUser();

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.reload();
  };

  if (user)
    return (
      <button className="text-left grow-0" onClick={handleSignOut}>
        Sign out
      </button>
    );

  return null;
}
