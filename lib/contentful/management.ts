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
