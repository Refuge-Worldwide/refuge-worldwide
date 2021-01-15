import Head from "next/head";
import { SEO } from "../../constants";
import { ShowInterface } from "../../types/shared";

export default function ShowMeta({
  title,
  date,
  coverImage,
  content,
  slug,
}: ShowInterface) {
  const excerpt = content?.json?.content
    ?.filter((el) => el?.nodeType === "paragraph")
    ?.slice(0, 1)
    ?.pop()
    ?.content?.filter((el) => el?.nodeType === "text")
    ?.slice(0, 1)
    ?.pop();

  // @ts-ignore
  const description = excerpt.value || SEO.DESCRIPTION;

  return (
    <Head>
      <title key="title">{title}</title>
      <meta property="og:title" content={title} />

      <meta name="description" content={description} />
      <meta property="og:description" content={description} />

      <meta property="og:image" content={coverImage.url} />
      <meta property="og:image:width" content={coverImage.width.toString()} />
      <meta property="og:image:height" content={coverImage.height.toString()} />
      <meta property="og:image:alt" content={coverImage.title} />

      <meta property="og:url" content={`${SEO.ROOT}/news/${slug}`} />

      <meta property="og:type" content="article" />
      <meta property="article:published_time" content={date} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@refugeworldwide" />
    </Head>
  );
}
