import Image from "next/image";
import { Fragment, ReactNode } from "react";
import { contentful } from "../lib/loaders";
import { CoverImage } from "../types/shared";
import BackButton from "./backButton";

export default function SinglePage({
  coverImage,
  children,
  withBackButton = false,
}: {
  coverImage: CoverImage;
  children: ReactNode;
  withBackButton?: boolean;
}) {
  return (
    <div className="relative">
      {withBackButton && (
        <div className="absolute left-4 sm:left-8 top-3 sm:top-4 z-20">
          <BackButton />
        </div>
      )}

      <div className="relative h-56 sm:h-96 md:h-112 lg:h-cover-image -z-10">
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
          objectPosition="center"
          priority
          src={coverImage.url}
        />
      </div>

      <div className="lg:-mt-96">{children}</div>
    </div>
  );
}
