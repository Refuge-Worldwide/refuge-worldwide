import Image from "next/image";
import Link from "next/link";
import { contentful } from "../lib/loaders";
import type { ArtistInterface } from "../types/shared";

export default function ArtistPreview({ name, photo, slug }: ArtistInterface) {
  return (
    <Link href={`/artists/${slug}`}>
      <a>
        <Image
          key={photo.sys.id}
          src={photo.url}
          loader={contentful}
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
