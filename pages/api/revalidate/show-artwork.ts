import { NextApiRequest, NextApiResponse } from "next";
import { previewClient } from "../../../lib/contentful/client";
import { showArtworkURL } from "../../../util";
import { updateArtwork } from "../../../lib/contentful/management";
import { createClient } from "contentful-management";

const accesstoken = process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN;
const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const environmentId = process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT_ID;

const client = createClient({
  accessToken: accesstoken,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // const origin = req.headers.origin;
  // const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL;

  // if (origin !== allowedOrigin) {
  //   return res.status(403).json({ error: "Forbidden" });
  // }

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    try {
      const show = req.body;
      const regenerate = req.query.regenerate ? true : false;
      const coverImageId = show.coverImage.sys.id;

      // Fetch the asset details from Contentful
      const coverImageAsset = await previewClient.getAsset(coverImageId);

      // Extract the URL of the cover image
      const coverImageUrl = coverImageAsset.fields.file.url;
      const formattedCoverUrl = coverImageUrl.startsWith("//")
        ? `https:${coverImageUrl}`
        : coverImageUrl;

      // Start with cover image
      let images = [{ url: formattedCoverUrl }];

      // Handle both new additionalMediaImages and legacy additionalImages
      if (show.additionalMediaImages && show.additionalMediaImages.length > 0) {
        // Fetch the full asset details for additionalMediaImages
        for (const mediaImageRef of show.additionalMediaImages) {
          try {
            const mediaAsset = await previewClient.getAsset(
              mediaImageRef.sys.id
            );
            const imageUrl = mediaAsset.fields.file.url;
            images.push({
              url: imageUrl.startsWith("//") ? `https:${imageUrl}` : imageUrl,
            });
          } catch (err) {
            console.error(
              `Failed to fetch media image asset ${mediaImageRef.sys.id}:`,
              err
            );
          }
        }
      } else if (show.additionalImages) {
        // Fallback to legacy additionalImages field (already URLs)
        show.additionalImages.forEach((image) => {
          images.push({ url: image });
        });
      }

      let artists = show.title.split(" | ")[1];

      if (!regenerate) {
        // Fetch the artist entries from Contentful
        const artistIds = show.artists.map((artist) => artist.sys.id);
        const artistEntries = await Promise.all(
          artistIds.map((id) => previewClient.getEntry(id))
        );

        artists = artistEntries.map((entry) => ({
          label: entry.fields.name,
        }));
      }

      const showTitle = show.title.split(" | ")[0];

      if (!showTitle) {
        throw new Error("No artists listed in title after | symbol");
      }

      const values = {
        image: images,
        showName: showTitle,
        artists: artists,
        datetime: show.date,
        datetimeEnd: show.dateEnd,
      };

      const url = showArtworkURL(values, false, regenerate);

      // Fetch the artwork from our API endpoint
      const artworkResponse = await fetch(url);
      if (!artworkResponse.ok) {
        throw new Error(
          `Failed to fetch artwork: ${artworkResponse.statusText}`
        );
      }

      // Get the image as an ArrayBuffer
      const artworkArrayBuffer = await artworkResponse.arrayBuffer();

      // Upload directly to Contentful using binary data
      const space = await client.getSpace(spaceId);
      const environment = await space.getEnvironment(environmentId);

      // Step 1: Create an upload with the binary data
      const upload = await environment.createUpload({
        file: artworkArrayBuffer,
      });

      // Step 2: Create asset with reference to the upload
      let artworkAsset = await environment.createAsset({
        fields: {
          title: {
            "en-US": showTitle + " - show artwork",
          },
          file: {
            "en-US": {
              contentType: "image/png",
              fileName: showTitle + "-show-artwork.png",
              uploadFrom: {
                sys: {
                  type: "Link",
                  linkType: "Upload",
                  id: upload.sys.id,
                },
              },
            },
          },
        },
      });

      // Step 3: Process and publish the asset
      const processedArtworkAsset = await artworkAsset.processForAllLocales();
      await processedArtworkAsset.publish();

      const artworkId = processedArtworkAsset.sys.id;
      console.log(artworkId);
      await updateArtwork(show.id, artworkId);

      res.status(200).json({ message: "Regeneration triggered successfully!" });
    } catch (error) {
      console.error("Revalidation error:", error);
      res.status(500).json({ message: error });
    }
  } else {
    res.status(405).json({ error: "Method not allowed." });
  }
}
