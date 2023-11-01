import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "contentful-management";
import { richTextFromMarkdown } from "@contentful/rich-text-from-markdown";
import { GoogleSpreadsheet } from "google-spreadsheet";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import ExtraArtists from "../../components/formFields/extraArtists";

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
  // process guest images for sheet
  let guestImages = "";
  if (values.hasExtraArtists) {
    values.extraArtists.forEach((e, index) => {
      console.log(e);
      if (index > 0) {
        guestImages += " + ";
      }
      guestImages += e.image.url;
    });
  }
  // process artist for sheet
  let images = "";
  values.image.forEach((e, index) => {
    console.log(e);
    if (index > 0) {
      images += " + ";
    }
    images += e.url;
  });

  console.log(guestImages);
  console.log(images);

  const newRow = {
    Timestamp: dayjs().tz("Europe/Berlin").format("DD/MM/YYYY HH:mm:ss"),
    "Show name": values.showName,
    "Show date": dayjs(values.datetime).format("DD/MM/YYYY HH:mm"),
    "Show description": values.description,
    "Host name(s)": values.artists.map((x) => x.label).join(", "),
    // "Guest name(s)": values.guests.map((x) => x.name).join(", "),
    "Show genres (up to 3)": values.genres.map((x) => x.label).join(", "),
    "Instagram @ handle(s)": values.instagram
      .split(", ")
      .map((s) => "@" + s)
      .join(" "),
    "Show / Host image - landscape format, ideally 1800x1450px or larger, 10MB max, no HEIC files. Please include show and host names in filename.":
      images,
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

//transform array to array of images for contentful
const createImagesReferencesArray = (array) => {
  let referencesArray = [];
  array.forEach((element) => {
    referencesArray.push({
      sys: {
        type: "Link",
        linkType: "Asset",
        id: element,
      },
    });
  });
  return referencesArray;
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
    throw 400;
  }
};

const formatArtistsForContenful = (
  artistsFromForm,
  hasExtraArtists,
  extraArtists
) => {
  let artists = [...artistsFromForm];
  // if (hasExtraArtists) {
  //   extraArtists.forEach((guest) => {
  //     artists.push({ label: guest.name });
  //   });
  // }
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
    throw 400;
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
    showImages.push(imageURL);
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
  console.log(dayjs().utcOffset());
  try {
    values.imageId = await uploadImage(values.showName, values.image[0]);
    // if (values.image.length > 1) {
    //   console.log("additional images to upload")
    //   values.additionalImages = []
    //   let additionalImagesToUpload = values.images.slice(1)
    //   console.log(additionalImagesToUpload)
    //   for (var i = 0; i < additionalImagesToUpload.length; i++) {
    //     console.log(additionalImagesToUpload[i])
    //     const uploadedLoaded = await uploadImage(values.showName + "[" + i + "]", additionalImagesToUpload[i]);
    //     console.log("image uploaded")
    //     console.log(uploadedLoaded)
    //     values.additionalImages.push(uploadedLoaded)
    //   };
    // }
    if (values.hasExtraArtists) {
      for (const artist of values.extraArtists) {
        const contentfulNewArtist = await addArtist(artist);
        values.artists.push(contentfulNewArtist);
      }
    }
    if (values.hasNewGenres) {
      const genres = values.newGenres.split(", ");
      for (const genre of genres) {
        const contentfulNewGenre = await addGenre(genre);
        values.genres.push(contentfulNewGenre);
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
