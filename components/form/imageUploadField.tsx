import React, { useState } from "react";
import ReactDOM from "react-dom";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";

import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";

import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

// Register the plugins
registerPlugin(FilePondPluginImagePreview);
registerPlugin(FilePondPluginFileValidateType);
registerPlugin(FilePondPluginFileValidateSize);

const serverOptions = {
  url: "/api/image-upload",
};

// Our app
export default function ImageUploadField({
  label,
  name,
  required,
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  const [files, setFiles] = useState([]);
  return (
    <div className="mb-10">
      <label htmlFor={name}>
        {label}
        {required && "*"}
        <span className="label-description">
          Landscape format, 1800x1450px or larger, 5MB max, no HEIC. Please
          include show and host names in filename.
        </span>
      </label>
      <FilePond
        className="min-h-36"
        files={files}
        onupdatefiles={setFiles}
        allowMultiple={false}
        id={name}
        name={name}
        required={required}
        credits={false}
        // onupdatefiles={file => setFieldValue('file', file)}
        server="/api/image-upload"
        labelIdle='Drag & Drop your image or <span class="filepond--label-action">Browse</span>'
        acceptedFileTypes={["image/png", "image/jpeg"]}
        labelFileTypeNotAllowed="Invalid file type. Please only upload images of JPEG and PNG format"
        maxFileSize="5MB"
      />
      {/* remove alt text for now and implement when we move over to sanity */}
      {/* <label className="label-description" htmlFor="altText">
        Description of image for accessibility*
      </label>
      <input
        type="string"
        id="altText"
        name="altText"
        className="pill-input"
        required
      /> */}
    </div>
  );
}
