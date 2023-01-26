import { createClient } from "contentful-management";
const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_MANAGEMENT_ACCESS_TOKEN;

const client = createClient({
  accessToken: accessToken,
});
const space = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const environment = "submission-sandbox";

export default function handler(req, res) {
  // Get data submitted in request's body.

  // Optional logging to see the responses
  // in the command line where next.js app is running.

  console.log(req);

  client
    .getSpace(space)
    .then((space) => space.getEnvironment(environment))
    .then((environment) =>
      environment.createAssetFromFiles({
        fields: {
          title: {
            "en-US": "Asset title",
          },
          description: {
            // 'en-US': 'Asset description'
          },
          file: {
            "en-US": {
              contentType: "image/jpeg",
              fileName: "example.jpeg",
              file: req.files,
            },
          },
        },
      })
    )
    .then((asset) => asset.processForAllLocales())
    .then((asset) => asset.publish())
    .then(() => res.status(200).json({ data: "1234" }))
    .catch(console.error);
}
