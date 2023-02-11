import { createClient } from "contentful-management";
import { richTextFromMarkdown } from "@contentful/rich-text-from-markdown";
const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_MANAGEMENT_ACCESS_TOKEN;
const client = createClient({
  accessToken: accessToken,
});
const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const environmentId = "submission-sandbox";
// const artistContentTypeId = 'artist'
const showContentTypeId = "show";
const artistContentTypeId = "artist";

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
      label: "",
    };
    return addedArtist;
  } catch (err) {
    console.log(err);
    throw 400;
  }
};

const addShow = async (values) => {
  try {
    const content = await richTextFromMarkdown(values.description);
    const artists = createReferencesArray(values.artists);
    const genres = createReferencesArray(values.genres);
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment(environmentId);
    const entry = await environment.createEntry(showContentTypeId, {
      fields: {
        title: {
          "en-US": values.name,
        },
        internal: {
          "en-US": values.name,
        },
        date: {
          "en-US": values.date,
        },
        content: {
          "en-US": content,
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
    return entry;
  } catch (err) {
    console.log(err);
    throw 400;
  }
};

// upload main image as asset and recieve id back
// async function uploadImage(image, name, alt space, environment){
//   client.getSpace(space)
//   .then((space) => space.getEnvironment(environment))
//   .then((environment) => environment.createAssetFromFiles({
//     fields: {
//       title: {
//         'en-US': name
//       },
//       description: {
//         'en-US': alt
//       },
//       file: {
//         'en-US': {
//           contentType: 'image/jpg',
//           fileName: name + '.jpg',
//           file: image
//         }
//       }
//     }
//   }))
//   .then((asset) => asset.processForAllLocales())
//   .then((asset) => asset.publish())
//   .catch(console.error)
// }

export default async function handler(req, res) {
  // Get data submitted in request's body.
  const values = req.body;
  console.log(values);
  try {
    if (values.extraArtists) {
      for (const extraArtist of values.extraArtists) {
        const contentfulExtraArtist = await addArtist(extraArtist);
        console.log(contentfulExtraArtist);
        values.artists.push(contentfulExtraArtist);
      }
    }
    await addShow(values);
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
