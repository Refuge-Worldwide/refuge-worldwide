import { createClient } from "contentful-management";

//transform array to array of references for contentful
export const createReferencesArray = (array) => {
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

export const formatArtistsForContenful = (
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
  if (artists.length == 0) {
    return "";
  } else if (artists.length > 1) {
    const artistSimpleArray = artists.map((artist) => artist.label);
    const formattedArtists = [
      artistSimpleArray.slice(0, -1).join(", "),
      artistSimpleArray.slice(-1)[0],
    ].join(artistSimpleArray.length < 2 ? "" : " & ");
    return formattedArtists;
  } else {
    return artists[0]?.label?.toString();
  }
};

export const uploadImage = async (name, image) => {
  const accesstoken = process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN;
  const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
  const client = createClient({
    accessToken: accesstoken,
  });
  const environmentId = process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT_ID;

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
    return processedAsset.sys.id;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const updateArtwork = async (id, artworkId) => {
  const accesstoken = process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN;
  const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
  const client = createClient({
    accessToken: accesstoken,
  });
  const environmentId = process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT_ID;

  try {
    client
      .getSpace(spaceId)
      .then((space) => space.getEnvironment(environmentId))
      .then((environment) => environment.getEntry(id))
      //update fields with values from form
      .then((entry) => {
        entry.fields.artwork = {
          "en-US": {
            sys: {
              type: "Link",
              linkType: "Asset",
              id: artworkId,
            },
          },
        };
        return entry.update();
      })
      .then((entry) => {
        return entry;
      });
  } catch (err) {
    console.log(err);
    throw err;
  }
};
