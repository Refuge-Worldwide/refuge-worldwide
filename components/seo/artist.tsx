import Head from "next/head";
import { SEO } from "../../constants";
import { ArtistEntry } from "../../types/shared";

export default function ArtistMeta({
  photo,
  name,
  slug,
}: Pick<ArtistEntry, "photo" | "name" | "slug">) {
  const image = `${photo.url}?w=1200&h=630&fit=pad`;

  return (
    <Head>
      <title key="title">{name} | Refuge Worldwide</title>
      <meta property="og:title" content={`${name} | Refuge Worldwide`} />

      <meta name="description" content={SEO.DESCRIPTION} />
      <meta property="og:description" content={SEO.DESCRIPTION} />

      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={photo.title} />

      <meta property="og:url" content={`${SEO.ROOT}/artists/${slug}`} />

      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@refugeworldwide" />
    </Head>
  );
}
