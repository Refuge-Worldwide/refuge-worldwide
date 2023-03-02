import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "contentful-management";
import { richTextFromMarkdown } from "@contentful/rich-text-from-markdown";
import { GoogleSpreadsheet } from "google-spreadsheet";
import dayjs from "dayjs";

const accesstoken = process.env.NEXT_PUBLIC_CONTENTFUL_MANAGEMENT_ACCESS_TOKEN;
const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const client = createClient({
  accessToken: accesstoken,
});
const environmentId = "submission-sandbox";
// const artistContentTypeId = 'artist'
const showContentTypeId = "show";
const artistContentTypeId = "artist";

const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_ID;
const SHEET_ID = process.env.NEXT_PUBLIC_SHEET_ID;
const GOOGLE_CLIENT_EMAIL = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_EMAIL;
const GOOGLE_SERVICE_PRIVATE_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_SERVICE_PRIVATE_KEY;

const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
const sheetImages = [];

// Append Function
const appendToSpreadsheet = async (values) => {
  const newRow = {
    Timestamp: dayjs().format("DD/MM/YYYY HH:mm:ss"),
    "Show name": values.name,
    "Show date": dayjs(values.datetime).format("DD/MM/YYYY HH:mm"),
    "Show description": values.description,
    "Artist name(s) + pronouns": values.artists.map((x) => x.label).join(", "),
    "Guest name(s) + pronouns": values.extraArtists
      .map((x) => x.name)
      .join(", "),
    "Show genres (up to 3)": values.genres.map((x) => x.label).join(", "),
    "Instagram @ handle(s)": values.instagram
      .split(", ")
      .map((s) => "@" + s)
      .join(" "),
    "Show / Host image - landscape format, ideally 1800x1450px or larger, 10MB max, no HEIC files. Please include show and host names in filename.":
      sheetImages.join(" + "),
    "Email address": values.email,
    "Is your show...": values.showType,
    "Contact phone number": values.number,
    "Live shows - are you bringing additional DJ or live-performance equipment (including laptop or controllers)?":
      values.additionalEq,
    "If yes, please state what equipment you'll be bringing":
      values.additionalEqDesc,
  };

  console.log(sheetImages);

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

//transform array to array of references for contentful
const createReferencesArray = (array) => {
  let referencesArray = [];
  array.forEach((element) => {
    referencesArray.push({
      sys: {
        type: "Link",
        linkType: "Entry",
        id: element.value,
      },
    });
  });
  return referencesArray;
};

const addArtist = async (extraArtist) => {
  try {
    const image = await uploadImage(extraArtist.name, extraArtist.guestImage);
    const content = await richTextFromMarkdown(extraArtist.bio);
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment(environmentId);
    const entry = await environment.createEntry(artistContentTypeId, {
      fields: {
        internal: {
          "en-US": extraArtist.name,
        },
        name: {
          "en-US": extraArtist.name,
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
      label: extraArtist.name,
    };
    return addedArtist;
  } catch (err) {
    console.log(err);
    throw 400;
  }
};

const formatArtistsForContenful = (artists) => {
  if (artists.length > 1) {
    const artistSimpleArray = artists.map((artist) => artist.label);
    const formattedArtists = [
      artistSimpleArray.slice(0, -1).join(", "),
      artistSimpleArray.slice(-1)[0],
    ].join(artistSimpleArray.length < 2 ? "" : " & ");
    return formattedArtists;
  } else {
    return artists[0].label.toString();
  }
};

const addShow = async (values) => {
  try {
    const content = await richTextFromMarkdown(values.description);
    const artists = createReferencesArray(values.artists);
    const artistsForContentful = formatArtistsForContenful(values.artists);
    const dateFormatted = dayjs(values.datetime).format("DD MMM YYYY");
    const genres = createReferencesArray(values.genres);
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment(environmentId);
    const endDateTime = dayjs(values.datetime + "Z")
      .add(parseInt(values.length), "hour")
      .toISOString();
    const entry = await environment.createEntry(showContentTypeId, {
      fields: {
        title: {
          "en-US": values.name + " | " + artistsForContentful,
        },
        internal: {
          "en-US":
            values.name + " - " + artistsForContentful + " - " + dateFormatted,
        },
        date: {
          "en-US": values.datetime,
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
    throw 400;
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
    sheetImages.push(imageURL);
    return processedAsset.sys.id;
  } catch (err) {
    console.log(err);
    throw 400;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get data submitted in request's body.
  const values = req.body;
  console.log(values);
  try {
    values.imageId = await uploadImage(values.name, values.image);
    if (values.hasExtraArtists) {
      for (const extraArtist of values.extraArtists) {
        const contentfulExtraArtist = await addArtist(extraArtist);
        console.log(contentfulExtraArtist);
        values.artists.push(contentfulExtraArtist);
      }
    }
    await addShow(values);
    await appendToSpreadsheet(values);
    console.log("form submitted successfully");
    res.status(200).json({ data: "successfully created show :)" });
  } catch (err) {
    res.status(400).json({ data: "issue submitting form" });
  }
}

// internal?: Contentful.EntryFields.Symbol;
// mixcloudLink?: Contentful.EntryFields.Symbol;
// coverImage: Contentful.Asset;
// coverImagePosition: "top" | "center" | "bottom";
// title: Contentful.EntryFields.Symbol;
// slug: Contentful.EntryFields.Symbol;
// isFeatured?: Contentful.EntryFields.Boolean;
// date: Contentful.EntryFields.Date;
// artists: Contentful.Entry<TypeArtistFields>[];
// genres: Contentful.Entry<TypeGenreFields>[];
// content?: CFRichTextTypes.Block | CFRichTextTypes.Inline;

// to do

// transform slug
// transform rich text
// link artists and genres
