import { useRouter } from "next/dist/client/router";
import { Arrow } from "../icons/arrow";

export default function BackButton() {
  const router = useRouter();

  const handleOnClick = () => router.back();

  return (
    <button
      className="inline-flex items-center space-x-3 border-2 rounded-full bg-black text-white border-white shadow-pill-white"
      onClick={handleOnClick}
    >
      <Arrow size={24} className="mt-px transform rotate-180" />
      <span>Back</span>
    </button>
  );
}
