import { contentful } from ".";
import { extractCollection } from "../../util";

export async function getAllArtistPaths() {
  const data = await contentful(/* GraphQL */ `
    query {
      artistCollection(where: { slug_exists: true }, limit: 100) {
        items {
          slug
        }
      }
    }
  `);

  const collection = extractCollection<{ slug: string }>(
    data,
    "artistCollection"
  );

  const paths = collection.map((el) => ({
    params: { slug: el.slug },
  }));

  return paths;
}
