import { createClient } from "contentful-management";
import { richTextFromMarkdown } from "@contentful/rich-text-from-markdown";
const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_MANAGEMENT_ACCESS_TOKEN;

const client = createClient({
  accessToken: accessToken,
});
const space = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const environment = "submission-sandbox";
// const artistContentTypeId = 'artist'
const showContentTypeId = "show";

// convert string into rich text for description
const toRichText = async (text) => {
  const content = await richTextFromMarkdown(text);
  return content;
};

const addArtist = async () => {};

const addShow = async () => {};

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

// async function addExtraArtist(artist){

//   // convert the bio to rich text
//   const content = toRichText(artist.bio);

//   client
//   .getSpace(space)
//   .then((space) => space.getEnvironment(environment))
//   .then((environment) =>
//     environment.createEntry(showContentTypeId, {
//       fields: {
//         name: {
//           "en-US": artist.name,
//         },
//         internal: {
//           "en-US": artist.name,
//         },
//         content: {
//           "en-US": content
//         }
//       },
//     })
//   )
//   .then(() => {
//     res.status(200).json({ data: "successfully created show :)" })
//   })
//   .catch(() => {
//     console.error
//     res.status(400).json({ data: "issue submitting form" })
//   });
// }

export default function handler(req, res) {
  // Get data submitted in request's body.
  const body = req.body;

  // Optional logging to see the responses
  // in the command line where next.js app is running.
  console.log("body: ", body);

  // convert description to rich text
  const content = toRichText(req.body.showDescription);

  // Create show entry
  client
    .getSpace(space)
    .then((space) => space.getEnvironment(environment))
    .then((environment) =>
      environment.createEntry(showContentTypeId, {
        fields: {
          name: {
            "en-US": req.body.showName,
          },
          internal: {
            "en-US": req.body.showName,
          },
          date: {
            "en-US": req.body.showDate,
          },
          // content: {
          //   "en-US": content
          // },
          coverImagePosition: {
            "en-US": "center",
          },
          artists: {
            "en-US": createReferencesArray(req.body.artists),
          },
          genres: {
            "en-US": createReferencesArray(req.body.genres),
          },
        },
      })
    )
    .then(() => {
      res.status(200).json({ data: "successfully created show :)" });
    })
    .catch(() => {
      console.error;
      res.status(400).json({ data: "issue submitting form" });
    });
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
