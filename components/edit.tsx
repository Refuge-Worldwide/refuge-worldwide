import Link from "next/link";
import { AiOutlineEdit } from "react-icons/ai";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Edit({ id }: { id?: string }) {
  const pathname = usePathname();
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    fetch("/api/auth/is-staff")
      .then((res) => res.json())
      .then((data) => setIsStaff(!!data.isStaff))
      .catch(() => setIsStaff(false));
  }, []);

  if (id && isStaff)
    return (
      <Link
        className={`absolute ${
          pathname == "/" ? "mt-[58px] sm:mt-28 " : "mt-4"
        } right-6 rounded-full border border-black bg-white p-3 shadow-md z-10`}
        href={`https://app.contentful.com/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}/entries/${id}`}
        target="_blank"
      >
        <AiOutlineEdit size={20} aria-label="Edit" />
      </Link>
    );
}
