import Image from "next/image";
import type { ArtistInterface } from "../types/shared";

export default function Artist({ name, photo }: ArtistInterface) {
  return (
    <div>
      <Image src={photo.url} width={340} height={192} alt={name} />
      <p>{name}</p>
    </div>
  );
}
