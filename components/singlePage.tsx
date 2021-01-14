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
    <Fragment>
      <div className="relative h-56 sm:h-96 md:h-112 lg:h-cover-image">
        {withBackButton && (
          <div className="absolute left-4 sm:left-8 top-3 sm:top-4 z-10">
            <BackButton />
          </div>
        )}

        <Image
          className="-z-10"
          key={coverImage.sys.id}
          src={coverImage.url}
          loader={contentful}
          alt={coverImage.title}
          layout="fill"
          objectFit="cover"
          objectPosition="center"
        />
      </div>

      <div className="lg:-mt-96 z-10">{children}</div>
    </Fragment>
  );
}
