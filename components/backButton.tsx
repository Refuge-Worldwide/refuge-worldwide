import Link from "next/link";
import { Arrow } from "../icons/arrow";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useState } from "react";

export default function BackButton({ backPath }: { backPath: string }) {
  const [hasBack, setHasBack] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (window?.history?.length > 1) {
      setHasBack(true);
    }
  }, []);

  if (hasBack) {
    return (
      <button
        onClick={() => router.back()}
        className="inline-flex items-center py-3 pr-4 sm:pr-6 pl-4 gap-3 border-2 rounded-full bg-black text-white border-white shadow-pill-white focus:outline-none focus:ring-4 font-light"
      >
        <Arrow
          size={24}
          colour="white"
          className="h-5 w-5 sm:h-6 sm:w-6 rotate-180"
        />
        <span className="hidden sm:inline leading-6">Back</span>
      </button>
    );
  } else {
    return (
      <Link
        href={backPath}
        className="inline-flex items-center py-3 pr-4 sm:pr-6 pl-4 gap-3 border-2 rounded-full bg-black text-white border-white shadow-pill-white focus:outline-none focus:ring-4 font-light"
      >
        <Arrow
          size={24}
          colour="white"
          className="h-5 w-5 sm:h-6 sm:w-6 rotate-180"
        />
        <span className="hidden sm:inline leading-6">Back</span>
      </Link>
    );
  }
}
