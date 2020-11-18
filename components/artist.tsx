import Image from "next/image";
import Link from "next/link";
import type { ArtistInterface } from "../types/shared";

export default function Artist({ name, photo, slug }: ArtistInterface) {
  return (
    <Link href={`/artists/${slug}`}>
      <a>
        <Image
          className="object-cover object-center"
          src={photo.url}
          width={340}
          height={192}
          alt={name}
        />
        <p>{name}</p>
      </a>
    </Link>
  );
}
