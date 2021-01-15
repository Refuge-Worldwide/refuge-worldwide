import Image from "next/image";
import { ReactNode } from "react";
import { contentful } from "../lib/loaders";
import { CoverImage, CoverImagePosition } from "../types/shared";
import BackButton from "../components/backButton";

export default function SinglePage({
  coverImage,
  children,
  withBackButton = false,
  objectPosition = "center",
}: {
  coverImage: CoverImage;
  children: ReactNode;
  withBackButton?: boolean;
  objectPosition?: CoverImagePosition;
}) {
  return (
    <div className="relative">
      {withBackButton && (
        <div className="absolute left-4 sm:left-8 top-3 sm:top-4 z-20">
          <BackButton />
        </div>
      )}

      <div className="relative h-72 sm:h-96 md:h-112 lg:h-cover-image -z-10">
        <Image
          alt={""}
          aria-hidden
          className="select-none "
          draggable={false}
          key={coverImage.sys.id}
          layout="fill"
          loader={contentful}
          loading="eager"
          objectFit="cover"
          objectPosition={objectPosition}
          priority
          src={coverImage.url}
        />
      </div>

      <div className="lg:-mt-24">{children}</div>
    </div>
  );
}
