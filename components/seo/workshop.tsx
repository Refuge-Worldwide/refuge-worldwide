import Head from "next/head";
import { SEO } from "../../constants";
import { WorkshopInterface } from "../../types/shared";

export default function WorkshopMeta({
  title,
  coverImage,
  content,
  slug,
}: WorkshopInterface) {
  // const excerpt = workshopSignupInfo?.json?.content
  //   ?.filter((el) => el?.nodeType === "paragraph")
  //   ?.slice(0, 1)
  //   ?.pop()
  //   ?.content?.filter((el) => el?.nodeType === "text")
  //   ?.slice(0, 1)
  //   ?.pop();

  // @ts-ignore
  const description = SEO.DESCRIPTION;

  const image = `${coverImage.url}?w=1200&h=630&fit=pad`;

  return (
    <Head>
      <title key="title">{title} | Refuge Worldwide</title>
      <meta property="og:title" content={title} />

      <meta name="description" content={description} />
      <meta property="og:description" content={description} />

      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={coverImage.title} />

      <meta property="og:url" content={`${SEO.ROOT}/workshops/${slug}`} />

      <meta property="og:type" content="article" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@refugeworldwide" />
    </Head>
  );
}
