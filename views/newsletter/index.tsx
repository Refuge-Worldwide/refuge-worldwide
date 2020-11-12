import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Image from "next/image";
import { Fragment } from "react";
import type { NewsletterPageData } from "../../lib/api";

export default function NewsletterView({ data }: { data: NewsletterPageData }) {
  return (
    <Fragment>
      <Image
        className="max-w-full"
        src={data?.coverImage?.url}
        alt={data?.coverImage?.title}
        width={data?.coverImage?.width}
        height={data?.coverImage?.height}
      />

      {documentToReactComponents(data?.content?.json)}
    </Fragment>
  );
}
