import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "contentful-management";
import { richTextFromMarkdown } from "@contentful/rich-text-from-markdown";
import { GoogleSpreadsheet } from "google-spreadsheet";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  formatArtistsForContenful,
  createReferencesArray,
} from "../../lib/contentful/management";
import { getShowById } from "../../lib/contentful/pages/submission";
import { sendSlackMessage } from "../../lib/slack";
import { showArtworkURL } from "../../util";
import { uploadImage } from "../../lib/contentful/management";

dayjs.extend(utc);
dayjs.extend(timezone);

const accesstoken = process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN;
const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const client = createClient({
  accessToken: accesstoken,
});
const environmentId = process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT_ID;
const showContentTypeId = "show";
const artistContentTypeId = "artist";
const genreContentTypeId = "genre";

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_ID = process.env.SHEET_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_SERVICE_PRIVATE_KEY = process.env.GOOGLE_SERVICE_PRIVATE_KEY;

const doc = new GoogleSpreadsheet(SPREADSHEET_ID);

// Append Function
const appendToSpreadsheet = async (values) => {
  let guestImages = "";
  if (values.hasGuests) {
    values.guests.forEach((guest, index) => {
      if (guest.image) {
        if (index > 0) {
          guestImages += " + ";
        }
        guestImages += guest.image.url;
      }
    });
  }
  const newRow = {
    Timestamp: dayjs().tz("Europe/Berlin").format("DD/MM/YYYY HH:mm:ss"),
    "Show name": values.showName,
    "Show date": dayjs(values.datetime).format("DD/MM/YYYY HH:mm"),
    "Show description": values.description,
    "Host name(s)": values.artists.map((x) => x.label).join(", "),
    // "Guest name(s)": values.guests.map((x) => x.name).join(", "),
    "Show genres (up to 3)": values.genres.map((x) => x.label).join(", "),
    "Instagram @ handle(s)": formatInstaHandles(values.instagram),
    "Show / Host image - landscape format, ideally 1800x1450px or larger, 10MB max, no HEIC files. Please include show and host names in filename.":
      values.image.url,
    "Guest image  - landscape format, ideally 1800x1450px or larger, 10MB max, no HEIC files. Please include show and host names in filename.":
      guestImages,
    "Email address": values.email,
    "Is your show...": values.showType,
    "Contact phone number": values.number,
    "Live shows - are you bringing additional DJ or live-performance equipment (including laptop or controllers)?":
      values.additionalEq,
    "If yes, please state what equipment you'll be bringing":
      values.additionalEqDesc,
  };

  try {
    await doc.useServiceAccountAuth({
      client_email: GOOGLE_CLIENT_EMAIL,
      private_key: GOOGLE_SERVICE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
    // loads document properties and worksheets
    await doc.loadInfo();

    const sheet = doc.sheetsById[SHEET_ID];
    await sheet.addRow(newRow);
  } catch (e) {
    console.error("Error: ", e);
  }
};

const addArtist = async (artist) => {
  try {
    // Use existing asset ID if available, otherwise upload
    let imageId;
    if (artist.image.id) {
      imageId = artist.image.id;
    } else {
      imageId = await uploadImage(artist.name, artist.image);
    }

    const content = await richTextFromMarkdown(artist.bio);
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment(environmentId);
    const entry = await environment.createEntry(artistContentTypeId, {
      fields: {
        internal: {
          "en-US": artist.name,
        },
        name: {
          "en-US": artist.name,
        },
        pronouns: {
          "en-US": artist.pronouns,
        },
        email: {
          "en-US": [artist.email],
        },
        role: {
          "en-US": false,
        },
        photo: {
          "en-US": {
            sys: {
              type: "Link",
              linkType: "Asset",
              id: imageId,
            },
          },
        },
        coverImagePosition: {
          "en-US": "center",
        },
        content: {
          "en-US": content,
        },
      },
    });
    const addedArtist = {
      value: entry.sys.id,
      label: artist.name,
    };
    return addedArtist;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const addGenre = async (genre) => {
  try {
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment(environmentId);
    const entry = await environment.createEntry(genreContentTypeId, {
      fields: {
        name: {
          "en-US": genre,
        },
      },
    });
    const addedGenre = {
      value: entry.sys.id,
      label: genre,
    };
    return addedGenre;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const updateArtist = async (artist) => {
  try {
    const content = await richTextFromMarkdown(artist.bio);

    client
      .getSpace(spaceId)
      .then((space) => space.getEnvironment(environmentId))
      .then((environment) => environment.getEntry(artist.id))
      //update fields with values from form
      .then((entry) => {
        entry.fields.content = {
          "en-US": content,
        };
        entry.fields.pronouns = {
          "en-US": artist.pronouns,
        };
        if (artist.imageId) {
          entry.fields.photo = {
            "en-US": {
              sys: {
                type: "Link",
                linkType: "Asset",
                id: artist.imageId,
              },
            },
          };
          entry.fields.coverImagePosition = {
            "en-US": "center",
          };
        }
        return entry.update();
      })
      .then((entry) => {
        console.log(`Entry ${entry.sys.id} updated.`);
        return entry;
      });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const updateShow = async (values) => {
  try {
    const content = await richTextFromMarkdown(values.description);
    const artists = createReferencesArray(values.artists);
    const artistsForContentful = formatArtistsForContenful(
      values.artists,
      values.hasExtraArtists,
      values.extraArtists
    );
    const dateFormatted = dayjs(values.datetime).format("DD MMM YYYY");
    const genres = createReferencesArray(values.genres);

    // Create asset references for additional images
    // Use existing asset IDs if available, otherwise upload
    let additionalMediaImages = [];
    if (values.image.length > 1) {
      for (const image of values.image.slice(1)) {
        let assetId;

        // Check if we already have an asset ID (from FilePond upload)
        if (image.id) {
          assetId = image.id;
        } else {
          // Fallback: upload the image if no ID exists (backward compatibility)
          assetId = await uploadImage(
            `${values.showName} - additional image`,
            image
          );
        }

        additionalMediaImages.push({
          sys: {
            type: "Link",
            linkType: "Asset",
            id: assetId,
          },
        });
      }
    }

    console.log(genres);
    client
      .getSpace(spaceId)
      .then((space) => space.getEnvironment(environmentId))
      .then((environment) => environment.getEntry(values.id))
      //update fields with values from form
      .then((entry) => {
        entry.fields.title = {
          "en-US": values.showName + " | " + artistsForContentful,
        };
        entry.fields.internal = {
          "en-US":
            values.showName +
            " - " +
            artistsForContentful +
            " - " +
            dateFormatted,
        };
        entry.fields.content = {
          "en-US": content,
        };
        entry.fields.coverImage = {
          "en-US": {
            sys: {
              type: "Link",
              linkType: "Asset",
              id: values.imageId,
            },
          },
        };
        entry.fields.coverImagePosition = {
          "en-US": "center",
        };
        entry.fields.artists = {
          "en-US": artists,
        };
        entry.fields.genres = {
          "en-US": genres,
        };
        entry.fields.status = {
          "en-US": "Submitted",
        };
        // Save additional images as Contentful asset references
        if (additionalMediaImages.length > 0) {
          entry.fields.additionalMediaImages = {
            "en-US": additionalMediaImages,
          };
        }
        entry.fields.instagramHandles = {
          "en-US": formatInstaHandles(values.instagram),
        };
        if (values.artwork) {
          entry.fields.artwork = {
            "en-US": {
              sys: {
                type: "Link",
                linkType: "Asset",
                id: values.artwork,
              },
            },
          };
        }
        return entry.update();
      })
      .then((entry) => {
        console.log(`Entry ${entry.sys.id} updated.`);
        return entry;
      });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const showArtwork = async (values) => {
  // Get URL for social image
  const url = showArtworkURL(values);

  try {
    // Fetch the artwork from our API endpoint
    const artworkResponse = await fetch(url);
    if (!artworkResponse.ok) {
      throw new Error(`Failed to fetch artwork: ${artworkResponse.statusText}`);
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
    let asset = await environment.createAsset({
      fields: {
        title: {
          "en-US": values.showName + " - show artwork",
        },
        file: {
          "en-US": {
            contentType: "image/png",
            fileName: values.showName + "-show-artwork.png",
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
    const processedAsset = await asset.processForAllLocales();
    await processedAsset.publish();

    return processedAsset.sys.id;
  } catch (err) {
    console.error("Error generating/uploading artwork:", err);
    throw err;
  }
};

const formatInstaHandles = (handles) => {
  if (handles != "")
    return handles
      .split(", ")
      .map((s) => "@" + s)
      .join(" ");
  else return "";
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const values = req.body;
  console.log("REQUEST METHOD: " + req.method);
  switch (req.method) {
    case "GET":
      //get show by id
      try {
        const { id } = req.query as typeof req.query & {
          id: string;
        };
        console.log(id);

        const show = await getShowById(id, true);
        console.log(show);
        if (!show) {
          res.status(404).json({ message: "Show not found" });
          break;
        }
        res.status(200).json(show);
        break;
      } catch (error) {
        console.log(error);

        res.status(400).json({ message: error.message });
      }
    case "PATCH":
      //submit show update to contentful
      console.log(values);
      console.log("UPDATING");
      console.log(dayjs().utcOffset());
      try {
        // Use existing asset ID if available, otherwise upload
        if (values.image[0].id) {
          values.imageId = values.image[0].id;
        } else {
          // Fallback: upload the image if no ID exists (backward compatibility)
          values.imageId = await uploadImage(values.showName, values.image[0]);
        }

        if (values.hasExtraArtists) {
          for (const artist of values.extraArtists) {
            // if ((artist.bio && artist.image) || (artist.bio !== "" && artist.image !== "")) {
            console.log("adding artist to contentful: " + artist.name);
            const contentfulNewArtist = await addArtist(artist);
            console.log(contentfulNewArtist);
            values.artists.push(contentfulNewArtist);
            // }
          }
        }
        if (values.hasNewGenres) {
          const genres = values.newGenres.split(", ");
          for (const genre of genres) {
            const contentfulNewGenre = await addGenre(genre);
            values.genres.push(contentfulNewGenre);
          }
        }
        if (values.artistsAdditionalInfo) {
          for (const artist of values.artistsAdditionalInfo) {
            if (artist.image) {
              // Use existing asset ID if available, otherwise upload
              if (artist.image.id) {
                artist.imageId = artist.image.id;
              } else {
                artist.imageId = await uploadImage(artist.name, artist.image);
              }
            }
            await updateArtist(artist);
          }
        }
        // wrap social image in another try block so it doesnt blcok the main submission
        try {
          values.artwork = await showArtwork(values);
        } catch (err) {
          sendSlackMessage(
            "Error generating social image for " + values.name,
            "error"
          );
        }
        await updateShow(values);
        await appendToSpreadsheet(values);
        console.log("form submitted successfully");
        res.status(200).json({ data: "successfully updated show :)" });
      } catch (err) {
        const message = `⚠️ ERROR SUBMITTING FORM
        \n\nShow: ${values.showName}
        \nError: ${err}`;
        sendSlackMessage(message, "error");
        res.status(400).json({ data: "issue submitting form" });
      }
  }
}
