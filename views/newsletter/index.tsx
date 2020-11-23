import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Image from "next/image";
import { Fragment } from "react";
import type { NewsletterPageData } from "../../lib/api";

export default function NewsletterView({ data }: { data: NewsletterPageData }) {
  return (
    <Fragment>
      <Image
        className="object-cover object-center"
        src={data?.coverImage?.url}
        alt={data?.coverImage?.title}
        width={1280}
        height={720}
      />

      <div>{documentToReactComponents(data?.content?.json)}</div>
    </Fragment>
  );
}
