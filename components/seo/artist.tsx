import Head from "next/head";
import { SEO } from "../../constants";
import { ArtistInterface } from "../../types/shared";

export default function ArtistMeta({ photo, name, slug }: ArtistInterface) {
  return (
    <Head>
      <title key="title">{name} | Refuge Worldwide</title>
      <meta property="og:title" content={`${name} | Refuge Worldwide`} />

      <meta name="description" content={SEO.DESCRIPTION} />
      <meta property="og:description" content={SEO.DESCRIPTION} />

      <meta property="og:image" content={photo.url} />
      <meta property="og:image:width" content={photo.width.toString()} />
      <meta property="og:image:height" content={photo.height.toString()} />
      <meta property="og:image:alt" content={photo.title} />

      <meta property="og:url" content={`${SEO.ROOT}/artists/${slug}`} />

      <meta property="og:type" content="website" />
    </Head>
  );
}
