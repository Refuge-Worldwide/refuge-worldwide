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
          width={340}
          height={192}
          objectFit="cover"
          objectPosition="center"
          alt={name}
        />
        <p>{name}</p>
      </a>
    </Link>
  );
}
