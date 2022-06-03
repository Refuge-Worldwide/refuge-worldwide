import Image from "next/image";
import Link from "next/link";
import loaders from "../lib/loaders";
import type { AllArtistEntry } from "../types/shared";

export default function ArtistPreview({
  name,
  photo,
  slug,
}: Pick<AllArtistEntry, "name" | "photo" | "slug">) {
  return (
    <Link href={`/artists/${slug}`} prefetch={false}>
      <a>
        <Image
          key={photo.sys.id}
          src={photo.url}
          loader={loaders.contentful}
          width={590}
          height={345}
          objectFit="cover"
          objectPosition="center"
          className="bg-black/10"
          alt={name}
        />
        <p>{name}</p>
      </a>
    </Link>
  );
}
