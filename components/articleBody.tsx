import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { Fragment } from "react";
import { ArticleInterface } from "../types/shared";
import Date from "./date";
import Pill from "./pill";

export default function ArticleBody({
  title,
  date,
  subtitle,
  content,
  articleType,
}: ArticleInterface) {
  return (
    <div className="container-md">
      <div className="h-4 sm:h-8" />

      <Pill>
        <span className="font-serif">{articleType}</span>
      </Pill>

      <p className="text-small text-center">
        <Date dateString={date} />
      </p>

      <div className="h-6" />

      <h1 className="text-base sm:text-large text-center">{title}</h1>

      <div className="h-6" />

      <p className="font-medium text-center">{subtitle}</p>

      <div className="h-6" />

      <div className="p-4 sm:p-8 prose sm:prose-lg">
        {documentToReactComponents(content?.json)}
      </div>

      <div className="h-28" />
    </div>
  );
}
