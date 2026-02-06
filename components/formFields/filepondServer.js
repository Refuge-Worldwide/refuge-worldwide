export const serverOptions = {
  process: (fieldName, file, metadata, load, error, progress, abort) => {
    // Upload to Contentful via our API endpoint
    const url = `/api/upload-image`;
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    xhr.open("POST", url, true);
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

    xhr.upload.addEventListener("progress", (e) => {
      progress(e.lengthComputable, e.loaded, e.total);
    });

    xhr.onreadystatechange = (e) => {
      if (xhr.readyState !== 4) {
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        // Return the full response as a JSON string so we can access both URL and ID
        load(JSON.stringify(response));
        return;
      }

      error("Error uploading image");
    };

    formData.append("file", file);
    xhr.send(formData);

    return {
      abort: () => {
        xhr.abort();
      },
    };
  },
  revert: null,
  load: (source, load, error, progress, abort, headers) => {
    var myRequest = new Request(source);
    fetch(myRequest).then(function (response) {
      response.blob().then(function (myBlob) {
        load(myBlob);
      });
    });
  },
};
