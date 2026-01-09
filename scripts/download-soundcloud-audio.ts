import dayjs from "dayjs";
import { getAllEntries } from "../lib/contentful/client";
import { TypeShowFields } from "../types/contentful";
import { createClient } from "contentful-management";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";

const execAsync = promisify(exec);

// Load environment variables from .env file (simple implementation, no dependencies)
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    // Match KEY = 'VALUE' or KEY = "VALUE" or KEY = VALUE
    const match = line.match(
      /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*['"]?(.+?)['"]?\s*$/
    );
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "").trim();
    }
  });
}

const CONTENTFUL_MANAGEMENT_TOKEN =
  process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN;
const CONTENTFUL_SPACE_ID = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const CONTENTFUL_ENVIRONMENT_ID =
  process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT_ID || "master";

// Validate required environment variables
if (!CONTENTFUL_MANAGEMENT_TOKEN) {
  console.error(
    "❌ Error: CONTENTFUL_MANAGEMENT_ACCESS_TOKEN is not set in .env file"
  );
  process.exit(1);
}
if (!CONTENTFUL_SPACE_ID) {
  console.error(
    "❌ Error: NEXT_PUBLIC_CONTENTFUL_SPACE_ID is not set in .env file"
  );
  process.exit(1);
}

// TEST MODE: Only process this many shows
const TEST_LIMIT = 2;

// Helper function to check if URL is SoundCloud
function isSoundCloudUrl(url: string): boolean {
  return url.includes("soundcloud.com");
}

// Helper function to check if URL is Mixcloud
function isMixcloudUrl(url: string): boolean {
  return url.includes("mixcloud.com");
}

// Helper function to determine platform from URL
function getPlatform(url: string): "soundcloud" | "mixcloud" | "unknown" {
  if (isSoundCloudUrl(url)) return "soundcloud";
  if (isMixcloudUrl(url)) return "mixcloud";
  return "unknown";
}

// Helper function to download audio using yt-dlp (works for both SoundCloud and Mixcloud)
async function downloadAudio(url: string, showTitle: string): Promise<string> {
  const tempDir = path.join(process.cwd(), "temp");

  // Create temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Sanitize filename
  const sanitizedTitle = showTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const outputPath = path.join(tempDir, `${sanitizedTitle}.mp3`);

  const platform = getPlatform(url);
  console.log(`Downloading from ${platform}: ${url}`);

  try {
    // Use yt-dlp to download audio (you'll need to have yt-dlp installed)
    // Install with: pip install yt-dlp or brew install yt-dlp
    // yt-dlp supports both SoundCloud and Mixcloud
    const command = `yt-dlp -x --audio-format mp3 -o "${outputPath}" "${url}"`;
    await execAsync(command);

    console.log(`Downloaded successfully to: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`Failed to download from ${url}:`, error);
    throw error;
  }
}

// Helper function to upload audio file to Contentful as an asset
async function uploadAudioToContentful(
  filePath: string,
  title: string
): Promise<string> {
  const client = createClient({
    accessToken: CONTENTFUL_MANAGEMENT_TOKEN,
  });

  const space = await client.getSpace(CONTENTFUL_SPACE_ID);
  const environment = await space.getEnvironment(CONTENTFUL_ENVIRONMENT_ID);

  console.log(`Uploading ${filePath} to Contentful...`);

  // Read file and convert to base64
  const fileBuffer = fs.readFileSync(filePath);
  const base64File = fileBuffer.toString("base64");

  // Create asset
  const asset = await environment.createAsset({
    fields: {
      title: {
        "en-US": `${title} - Audio`,
      },
      file: {
        "en-US": {
          contentType: "audio/mpeg",
          fileName: path.basename(filePath),
          upload: `data:audio/mpeg;base64,${base64File}`,
        },
      },
    },
  });

  // Process and publish asset
  const processedAsset = await asset.processForAllLocales();
  await processedAsset.publish();

  console.log(`Asset uploaded and published: ${processedAsset.sys.id}`);

  return processedAsset.sys.id;
}

// Helper function to update show entry with audioFile
async function updateShowAudioFile(showId: string, audioAssetId: string) {
  const client = createClient({
    accessToken: CONTENTFUL_MANAGEMENT_TOKEN,
  });

  const space = await client.getSpace(CONTENTFUL_SPACE_ID);
  const environment = await space.getEnvironment(CONTENTFUL_ENVIRONMENT_ID);

  console.log(`Updating show ${showId} with audio file ${audioAssetId}...`);

  const entry = await environment.getEntry(showId);

  entry.fields.audioFile = {
    "en-US": {
      sys: {
        type: "Link",
        linkType: "Asset",
        id: audioAssetId,
      },
    },
  };

  const updatedEntry = await entry.update();
  await updatedEntry.publish();

  console.log(`Show ${showId} updated and published`);
}

async function main() {
  console.log("Fetching all shows from Contentful...");

  // Get all shows that have a mixcloudLink
  const allShows = await getAllEntries<TypeShowFields>("show", 500, {
    "fields.mixcloudLink[exists]": true,
  });

  console.log(`Found ${allShows.length} shows with mixcloudLink`);

  // Filter shows that don't have an audioFile and have a SoundCloud or Mixcloud link
  const showsToProcess = allShows.filter((show) => {
    const hasAudioFile = (show.fields as any).audioFile;
    const mixcloudLink = show.fields.mixcloudLink;
    const platform = mixcloudLink ? getPlatform(mixcloudLink) : "unknown";

    return (
      !hasAudioFile && (platform === "soundcloud" || platform === "mixcloud")
    );
  });

  console.log(
    `Found ${showsToProcess.length} shows without audioFile that have SoundCloud or Mixcloud links`
  );

  // Limit to TEST_LIMIT shows for testing
  const limitedShows = showsToProcess.slice(0, TEST_LIMIT);
  console.log(
    `\n🧪 TEST MODE: Processing only ${limitedShows.length} show(s)\n`
  );

  // Process each show
  for (const show of limitedShows) {
    try {
      console.log(`\n--- Processing: ${show.fields.title} ---`);
      console.log(`Show ID: ${show.sys.id}`);
      console.log(`URL: ${show.fields.mixcloudLink}`);

      // Download audio from SoundCloud or Mixcloud
      const audioFilePath = await downloadAudio(
        show.fields.mixcloudLink,
        show.fields.title
      );

      // Upload to Contentful
      const audioAssetId = await uploadAudioToContentful(
        audioFilePath,
        show.fields.title
      );

      // Update show entry
      await updateShowAudioFile(show.sys.id, audioAssetId);

      // Clean up local file
      fs.unlinkSync(audioFilePath);
      console.log(`Cleaned up local file: ${audioFilePath}`);

      console.log(`✓ Successfully processed: ${show.fields.title}\n`);
    } catch (error) {
      console.error(`✗ Failed to process show ${show.fields.title}:`, error);
      // Continue with next show even if this one fails
    }
  }

  // Clean up temp directory if empty
  const tempDir = path.join(process.cwd(), "temp");
  if (fs.existsSync(tempDir) && fs.readdirSync(tempDir).length === 0) {
    fs.rmdirSync(tempDir);
  }

  console.log("\n=== Processing complete ===");
  console.log(
    `Processed ${limitedShows.length} out of ${showsToProcess.length} eligible shows`
  );
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
