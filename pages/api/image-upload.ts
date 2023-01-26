import { createClient } from "contentful-management";
const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_MANAGEMENT_ACCESS_TOKEN;

const client = createClient({
  accessToken: accessToken,
});
const space = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const environment = "submission-sandbox";

export default function handler(req, res) {
  // Get data submitted in request's body.
  const body = req.body;

  // Optional logging to see the responses
  // in the command line where next.js app is running.
  console.log("body: ", body);

  client
    .getSpace(space)
    .then((space) => space.getEnvironment(environment))
    .then((environment) =>
      environment.createAssetFromFiles({
        fields: {
          title: {
            "en-US": req.name,
          },
          description: {
            "en-US": req.alt,
          },
          file: {
            "en-US": {
              contentType: "image/jpg",
              fileName: req.name + ".jpg",
              file: req.image,
            },
          },
        },
      })
    )
    .then((asset) => asset.processForAllLocales())
    .then((asset) => asset.publish())

    .catch(console.error);
}
