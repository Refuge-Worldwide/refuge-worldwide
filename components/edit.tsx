import Link from "next/link";
import { AiOutlineEdit } from "react-icons/ai";
import { usePathname } from "next/navigation";

export default function Edit({ id }: { id?: string }) {
  const pathname = usePathname();

  if (id)
    return (
      <Link
        className={`absolute ${
          pathname == "/" ? "mt-28" : "mt-4"
        } right-6 rounded-full border border-black bg-white p-4 shadow-md z-10`}
        href={`https://app.contentful.com/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}/entries/${id}`}
        target="_blank"
      >
        <AiOutlineEdit size={24} aria-label="Edit" />
      </Link>
    );
}
