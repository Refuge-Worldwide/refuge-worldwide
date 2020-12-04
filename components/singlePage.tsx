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
      {withBackButton && <BackButton />}

      <div>
        <Image
          key={coverImage.title}
          src={coverImage.url}
          alt={coverImage.title}
          width={640}
          height={360}
          objectFit="cover"
          objectPosition="center"
        />
      </div>

      <div>{children}</div>
    </Fragment>
  );
}
