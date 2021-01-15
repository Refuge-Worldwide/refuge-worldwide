import Head from "next/head";
import { SEO } from "../../constants";

export default function PageMeta({
  title,
  path,
}: {
  title: string;
  path: string;
}) {
  const photo = {
    url: `${SEO.ROOT}/og-thumb.jpg`,
    width: 1000,
    height: 1000,
    title: "Refuge Worldwide Brandmark",
  };

  return (
    <Head>
      <title key="title">{title}</title>
      <meta property="og:title" content={title} />

      <meta name="description" content={SEO.DESCRIPTION} />
      <meta property="og:description" content={SEO.DESCRIPTION} />

      <meta property="og:image" content={photo.url} />
      <meta property="og:image:width" content={photo.width.toString()} />
      <meta property="og:image:height" content={photo.height.toString()} />
      <meta property="og:image:alt" content={photo.title} />

      <meta property="og:url" content={`${SEO.ROOT}/${path}`} />

      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@refugeworldwide" />
    </Head>
  );
}
