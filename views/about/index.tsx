import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Image from "next/image";
import { Fragment } from "react";
import type { AboutPageData } from "../../lib/api";

export default function AboutView({ data }: { data: AboutPageData }) {
  return (
    <Fragment>
      <div className="relative" style={{ height: 960 }}>
        <Image
          className="object-cover object-top"
          src={data?.coverImage?.url}
          alt={data?.coverImage?.title}
          layout="fill"
        />
      </div>

      <div className="grid grid-cols-10 relative" style={{ marginTop: -360 }}>
        <div className="col-span-2" />
        <div className="col-span-6 bg-white">
          {documentToReactComponents(data?.content?.json)}
        </div>
        <div className="col-span-2" />
      </div>
    </Fragment>
  );
}
