import Link from "next/link";
import { Arrow } from "../icons/arrow";

export default function BackButton({ backPath }: { backPath: string }) {
  return (
    <Link href={backPath}>
      <a className="inline-flex items-center py-3 pr-4 sm:pr-6 pl-4 space-x-3 border-2 rounded-full bg-black text-white border-white shadow-pill-white focus:outline-none focus:ring-4 font-light">
        <Arrow size={24} className="h-5 w-5 sm:h-6 sm:w-6 rotate-180" />
        <span className="hidden sm:inline leading-6">Back</span>
      </a>
    </Link>
  );
}
