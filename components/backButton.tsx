import { useRouter } from "next/dist/client/router";
import { Arrow } from "../icons/arrow";

export default function BackButton() {
  const router = useRouter();

  const handleOnClick = () => router.back();

  return (
    <button
      className="inline-flex items-center py-3 pr-4 sm:pr-6 pl-4 space-x-3 border-2 rounded-full bg-black text-white border-white shadow-pill-white focus:outline-none focus:ring-4 font-light"
      onClick={handleOnClick}
    >
      <Arrow size={24} className="h-5 w-5 sm:h-6 sm:w-6 rotate-180" />
      <span className="hidden sm:inline leading-6">Back</span>
    </button>
  );
}
