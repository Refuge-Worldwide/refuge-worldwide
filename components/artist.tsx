import Image from "next/image";
import Link from "next/link";
import type { ArtistInterface } from "../types/shared";

export default function Artist({ name, photo, slug }: ArtistInterface) {
  return (
    <Link href={`/artists/${slug}`}>
      <a>
        <Image
          key={slug}
          src={photo.url}
          width={590}
          height={345}
          objectFit="cover"
          objectPosition="center"
          className="bg-black bg-opacity-10"
          alt={name}
        />
        <p>{name}</p>
      </a>
    </Link>
  );
}
