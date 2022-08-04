import Image from "next/future/image";
import Link from "next/link";
import loaders from "../lib/loaders";

type ArtistPreviewProps = {
  name: string;
  src: string;
  slug: string;
};

export default function ArtistPreview({ name, src, slug }: ArtistPreviewProps) {
  return (
    <Link href={`/artists/${slug}`} prefetch={false}>
      <a className="flex flex-col gap-2">
        <Image
          src={src}
          loader={loaders.contentful}
          width={590}
          height={335}
          className="bg-black/10 object-cover object-center aspect-video"
          alt={name}
        />

        <p>{name}</p>
      </a>
    </Link>
  );
}
