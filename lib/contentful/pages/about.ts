import { getPlaiceholder } from "plaiceholder";
import { graphql } from "..";
import { AboutPageData } from "../../../types/shared";
import { extractPage } from "../../../util";

export async function getAboutPage(preview: boolean) {
  const AboutPageQuery = /* GraphQL */ `
    query AboutPageQuery($preview: Boolean) {
      pageAbout(id: "z1SsoA1K4SMJryGuYjzhK", preview: $preview) {
        coverImage {
          sys {
            id
          }
          title
          description
          url
          width
          height
        }
        content {
          json
          links {
            assets {
              block {
                sys {
                  id
                }
                contentType
                title
                description
                url
                width
                height
              }
            }
          }
        }
      }
    }
  `;

  const data = await graphql(AboutPageQuery, {
    variables: { preview },
    preview,
  });

  const page = extractPage<AboutPageData>(data, "pageAbout");

  const { base64 } = await getPlaiceholder(page.coverImage.url);

  return {
    ...page,
    coverImageBlurDataURL: base64,
  };
}
