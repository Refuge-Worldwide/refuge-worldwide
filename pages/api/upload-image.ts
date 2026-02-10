import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "contentful-management";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

const accesstoken = process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN;
const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const environmentId = process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT_ID;

const client = createClient({
  accessToken: accesstoken,
});

const uploadToContentful = async (file: formidable.File) => {
  try {
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment(environmentId);

    // Read file buffer
    const fileBuffer = fs.readFileSync(file.filepath);

    // Step 1: Create an upload using binary data
    const upload = await environment.createUpload({
      file: fileBuffer,
    });

    // Step 2: Create asset with reference to the upload
    let asset = await environment.createAsset({
      fields: {
        title: {
          "en-US": file.originalFilename || file.newFilename,
        },
        file: {
          "en-US": {
            contentType: file.mimetype,
            fileName: file.originalFilename || file.newFilename,
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

    // Step 4: Get the file details
    const publishedAsset = await environment.getAsset(processedAsset.sys.id);
    const fileUrl = publishedAsset.fields.file["en-US"].url;

    return {
      id: processedAsset.sys.id,
      url: fileUrl.startsWith("//") ? `https:${fileUrl}` : fileUrl,
      filename: file.originalFilename || file.newFilename,
      contentType: file.mimetype,
    };
  } catch (err) {
    console.error("Error uploading to Contentful:", err);
    throw err;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({
      maxFileSize: 3 * 1024 * 1024, // 3MB
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form:", err);
        return res.status(400).json({ error: "Error parsing form data" });
      }

      const file = Array.isArray(files.file) ? files.file[0] : files.file;

      if (!file) {
        return res.status(400).json({ error: "No file provided" });
      }

      try {
        const uploadedAsset = await uploadToContentful(file);

        // Clean up temp file
        try {
          fs.unlinkSync(file.filepath);
        } catch (cleanupErr) {
          console.error("Error cleaning up temp file:", cleanupErr);
          // Don't fail the request if cleanup fails
        }

        return res.status(200).json(uploadedAsset);
      } catch (uploadErr) {
        console.error("Upload error:", uploadErr);
        // Clean up temp file even on error
        try {
          fs.unlinkSync(file.filepath);
        } catch (cleanupErr) {
          console.error("Error cleaning up temp file:", cleanupErr);
        }
        return res
          .status(500)
          .json({ error: "Error uploading file to Contentful" });
      }
    });
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
