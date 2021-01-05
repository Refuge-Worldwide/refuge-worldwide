import Image from "next/image";
import { Fragment, ReactNode } from "react";
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
      <div className="relative h-56 sm:h-96">
        {withBackButton && (
          <div className="absolute left-4 sm:left-8 top-3 sm:top-4 z-10">
            <BackButton />
          </div>
        )}

        <Image
          key={coverImage.title}
          src={coverImage.url}
          alt={coverImage.title}
          layout="fill"
          objectFit="cover"
          objectPosition="center"
        />
      </div>

      <div>{children}</div>
    </Fragment>
  );
}
