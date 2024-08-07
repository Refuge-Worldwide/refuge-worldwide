import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "contentful-management";
import { richTextFromMarkdown } from "@contentful/rich-text-from-markdown";
import { GoogleSpreadsheet } from "google-spreadsheet";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import ExtraArtists from "../../components/formFields/extraArtists";
import {
  formatArtistsForContenful,
  createReferencesArray,
} from "../../lib/contentful/management";
import { getShowById } from "../../lib/contentful/pages/submission";
import { sendSlackMessage } from "../../lib/slack";

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
const showImages = [];

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

  console.log(showImages);

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
    const image = await uploadImage(artist.name, artist.image);
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
        role: {
          "en-US": false,
        },
        photo: {
          "en-US": {
            sys: {
              type: "Link",
              linkType: "Asset",
              id: image,
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

const addShow = async (values) => {
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
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment(environmentId);
    const startDateTime = dayjs(values.datetime + "Z").toISOString();
    const endDateTime = dayjs(values.datetime + "Z")
      .add(parseInt(values.length), "hour")
      .toISOString();
    console.log("start: " + startDateTime);
    console.log("end: " + endDateTime);
    const entry = await environment.createEntry(showContentTypeId, {
      fields: {
        title: {
          "en-US": values.showName + " | " + artistsForContentful,
        },
        internal: {
          "en-US":
            values.showName +
            " - " +
            artistsForContentful +
            " - " +
            dateFormatted,
        },
        date: {
          "en-US": startDateTime,
        },
        dateEnd: {
          "en-US": endDateTime,
        },
        content: {
          "en-US": content,
        },
        coverImage: {
          "en-US": {
            sys: {
              type: "Link",
              linkType: "Asset",
              id: values.imageId,
            },
          },
        },
        coverImagePosition: {
          "en-US": "center",
        },
        artists: {
          "en-US": artists,
        },
        genres: {
          "en-US": genres,
        },
      },
    });
    console.log(entry);
    return entry;
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
    let additionalImages = [];
    values.image.slice(1).forEach((image) => {
      additionalImages.push(image.url);
    });
    Object.values(values.image).join(",");
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
        entry.fields.additionalImages = {
          "en-US": additionalImages,
        };
        entry.fields.instagramHandles = {
          "en-US": formatInstaHandles(values.instagram),
        };
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

const uploadImage = async (name, image) => {
  try {
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment(environmentId);
    let asset = await environment.createAsset({
      fields: {
        title: {
          "en-US": name,
        },
        file: {
          "en-US": {
            contentType: image.type,
            fileName: image.filename,
            upload: image.url,
          },
        },
      },
    });
    const processedAsset = await asset.processForAllLocales();
    await processedAsset.publish();
    const imageURL = "https:" + processedAsset.fields.file["en-US"].url;
    console.log(imageURL);
    showImages.push(imageURL);
    return processedAsset.sys.id;
  } catch (err) {
    console.log(err);
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
        values.imageId = await uploadImage(values.showName, values.image[0]);
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
              artist.imageId = await uploadImage(artist.name, artist.image);
            }
            await updateArtist(artist);
          }
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
