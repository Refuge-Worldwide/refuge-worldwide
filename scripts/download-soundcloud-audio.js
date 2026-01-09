const dayjs = require("dayjs");
const { createClient } = require("contentful");
const {
  createClient: createManagementClient,
} = require("contentful-management");
const { exec } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");

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

const CONTENTFUL_ACCESS_TOKEN = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;
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
if (!CONTENTFUL_ACCESS_TOKEN) {
  console.error(
    "❌ Error: NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN is not set in .env file"
  );
  process.exit(1);
}

// Create Contentful client
const contentfulClient = createClient({
  accessToken: CONTENTFUL_ACCESS_TOKEN,
  space: CONTENTFUL_SPACE_ID,
});

// Function to get all entries from Contentful (replaces getAllEntries from lib)
async function getAllEntries(contentType, perPage, options = {}) {
  const { total } = await contentfulClient.getEntries({
    content_type: contentType,
    limit: 1,
  });

  const entries = await Promise.all(
    [...Array(Math.round(total / perPage + 1))].map(async (_, index) => {
      const { items } = await contentfulClient.getEntries({
        ...options,
        content_type: contentType,
        limit: perPage,
        skip: index * perPage,
      });

      return items;
    })
  );

  return entries.flat();
}

// Set to null to process all shows, or a number to limit
const LIMIT = null;

// Results tracking
const results = {
  successful: [],
  failed: [],
  skipped: [],
};

// Helper function to check if URL is SoundCloud
function isSoundCloudUrl(url) {
  return url.includes("soundcloud.com");
}

// Helper function to check if URL is Mixcloud
function isMixcloudUrl(url) {
  return url.includes("mixcloud.com");
}

// Helper function to determine platform from URL
function getPlatform(url) {
  if (isSoundCloudUrl(url)) return "soundcloud";
  if (isMixcloudUrl(url)) return "mixcloud";
  return "unknown";
}

// Helper function to download audio using yt-dlp (works for both SoundCloud and Mixcloud)
async function downloadAudio(url, showTitle) {
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
    // --audio-quality 0 gets the best available quality (320kbps or better)
    const command = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${outputPath}" "${url}"`;
    await execAsync(command);

    console.log(`Downloaded successfully to: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`Failed to download from ${url}:`, error);
    throw error;
  }
}

// Helper function to upload audio file to Contentful as an asset
async function uploadAudioToContentful(filePath, title) {
  const client = createManagementClient({
    accessToken: CONTENTFUL_MANAGEMENT_TOKEN,
  });

  const space = await client.getSpace(CONTENTFUL_SPACE_ID);
  const environment = await space.getEnvironment(CONTENTFUL_ENVIRONMENT_ID);

  console.log(`Uploading ${filePath} to Contentful...`);

  try {
    // Step 1: Create the upload from file
    const fileStats = fs.statSync(filePath);
    const fileBuffer = fs.readFileSync(filePath);

    console.log(`File size: ${(fileStats.size / 1024 / 1024).toFixed(2)} MB`);

    // Create upload
    const upload = await environment.createUpload({
      file: fileBuffer,
    });

    console.log(`Upload created: ${upload.sys.id}`);

    // Step 2: Create asset with reference to upload
    const asset = await environment.createAsset({
      fields: {
        title: {
          "en-US": `${title} - Audio`,
        },
        file: {
          "en-US": {
            contentType: "audio/mpeg",
            fileName: path.basename(filePath),
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

    console.log(`Asset created: ${asset.sys.id}`);

    // Step 3: Process the asset
    console.log("Processing asset...");
    const processedAsset = await asset.processForAllLocales();

    // Wait a bit for processing to complete
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Asset processed, publishing...");

    // Step 4: Publish the asset
    const publishedAsset = await processedAsset.publish();

    console.log(`Asset uploaded and published: ${publishedAsset.sys.id}`);

    return publishedAsset.sys.id;
  } catch (error) {
    console.error("Error uploading to Contentful:", error);
    throw error;
  }
}

// Helper function to update show entry with audioFile
async function updateShowAudioFile(showId, audioAssetId) {
  const client = createManagementClient({
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
  const allShows = await getAllEntries("show", 500, {
    "fields.mixcloudLink[exists]": true,
  });

  console.log(`Found ${allShows.length} shows with mixcloudLink`);

  // Filter shows that don't have an audioFile and have a SoundCloud or Mixcloud link
  // Also exclude shows with "(r)" in the title
  const showsToProcess = allShows.filter((show) => {
    const hasAudioFile = show.fields.audioFile;
    const mixcloudLink = show.fields.mixcloudLink;
    const platform = mixcloudLink ? getPlatform(mixcloudLink) : "unknown";
    const title = show.fields.title || "";
    const hasRInTitle = title.toLowerCase().includes("(r)");

    return (
      !hasAudioFile &&
      (platform === "soundcloud" || platform === "mixcloud") &&
      !hasRInTitle
    );
  });

  console.log(
    `Found ${showsToProcess.length} shows without audioFile that have SoundCloud or Mixcloud links`
  );

  // Apply limit if set
  const showsToRun = LIMIT ? showsToProcess.slice(0, LIMIT) : showsToProcess;
  if (LIMIT) {
    console.log(`\nLIMIT SET: Processing only ${showsToRun.length} show(s)\n`);
  } else {
    console.log(`\nProcessing all ${showsToRun.length} eligible show(s)\n`);
  }

  // Process each show
  for (let i = 0; i < showsToRun.length; i++) {
    const show = showsToRun[i];
    try {
      console.log(
        `\n[${i + 1}/${showsToRun.length}] --- Processing: ${
          show.fields.title
        } ---`
      );
      console.log(`Show ID: ${show.sys.id}`);
      console.log(`URL: ${show.fields.mixcloudLink}`);

      // Re-fetch the show from Contentful to ensure we have the latest data
      // This ensures safety if the script is run multiple times or entries are updated
      const freshShow = await contentfulClient.getEntry(show.sys.id);

      // Double-check that the show doesn't have an audioFile (safety check)
      if (freshShow.fields.audioFile) {
        console.log(
          `⚠️  SKIPPED: Show already has an audioFile, not overwriting`
        );
        results.skipped.push({
          title: show.fields.title,
          id: show.sys.id,
          reason: "Already has audioFile",
        });
        continue;
      }

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

      // Clean up local file immediately after successful upload
      fs.unlinkSync(audioFilePath);
      console.log(`Cleaned up local file: ${audioFilePath}`);

      console.log(`✓ Successfully processed: ${show.fields.title}\n`);
      results.successful.push({
        title: show.fields.title,
        id: show.sys.id,
        assetId: audioAssetId,
      });
    } catch (error) {
      console.error(
        `✗ Failed to process show ${show.fields.title}:`,
        error.message
      );
      results.failed.push({
        title: show.fields.title,
        id: show.sys.id,
        error: error.message,
        url: show.fields.mixcloudLink,
      });

      // Try to clean up file if it exists
      try {
        const sanitizedTitle = show.fields.title
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase();
        const tempFilePath = path.join(
          process.cwd(),
          "temp",
          `${sanitizedTitle}.mp3`
        );
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
          console.log(`Cleaned up failed download: ${tempFilePath}`);
        }
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }
  }

  // Clean up temp directory if it exists
  const tempDir = path.join(process.cwd(), "temp");
  if (fs.existsSync(tempDir)) {
    const remainingFiles = fs.readdirSync(tempDir);
    if (remainingFiles.length === 0) {
      fs.rmdirSync(tempDir);
      console.log("\nCleaned up temp directory");
    } else {
      console.log(
        `\n⚠️  Temp directory still has ${remainingFiles.length} file(s)`
      );
    }
  }

  // Print summary
  console.log("\n=== PROCESSING COMPLETE ===");
  console.log(`✓ Successful: ${results.successful.length}`);
  console.log(`✗ Failed: ${results.failed.length}`);
  console.log(`⊘ Skipped: ${results.skipped.length}`);
  console.log(
    `Total processed: ${showsToRun.length} out of ${showsToProcess.length} eligible shows`
  );

  // Write detailed results to file
  const resultsPath = path.join(
    process.cwd(),
    "scripts",
    "download-results.json"
  );
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\nDetailed results written to: ${resultsPath}`);

  // Print failed shows if any
  if (results.failed.length > 0) {
    console.log("\n--- FAILED SHOWS ---");
    results.failed.forEach((f) => {
      console.log(`- ${f.title} (${f.id}): ${f.error}`);
    });
  }

  // Print skipped shows if any
  if (results.skipped.length > 0) {
    console.log("\n--- SKIPPED SHOWS ---");
    results.skipped.forEach((s) => {
      console.log(`- ${s.title} (${s.id}): ${s.reason}`);
    });
  }
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
