import Image from "next/image";
import { ReactNode } from "react";
import BackButton from "../components/backButton";
import loaders from "../lib/loaders";
import { CoverImage, CoverImagePosition } from "../types/shared";

export default function SinglePage({
  coverImage,
  children,
  backPath,
  objectPosition = "center",
}: {
  coverImage: CoverImage;
  children: ReactNode;
  backPath?: string;
  objectPosition?: CoverImagePosition;
}) {
  return (
    <div className="relative">
      {backPath && (
        <div className="absolute left-4 sm:left-8 top-3 sm:top-4 z-20">
          <BackButton backPath={backPath} />
        </div>
      )}

      <div className="relative h-72 sm:h-96 md:h-112 lg:h-cover-image -z-10">
        <Image
          alt={coverImage.description ? coverImage.description : ""}
          className="select-none object-cover bg-black/10"
          draggable={false}
          key={coverImage.sys.id}
          loader={loaders.contentful}
          priority
          src={coverImage.url}
          style={{ objectPosition: objectPosition }}
          fill
        />
      </div>

      <div className="lg:-mt-24">{children}</div>
    </div>
  );
}
