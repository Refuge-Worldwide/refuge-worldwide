import { useEffect } from "react";
import { useRouter } from "next/router";

// Sign-in is now handled by Contentful OAuth on the calendar page.
export default function SignIn() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/calendar");
  }, []);
  return null;
}
