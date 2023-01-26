import React, { useState } from "react";
import ReactDOM from "react-dom";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";

// import SingleLineField from './singleLineField'

// import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImageValidateSize from "filepond-plugin-image-validate-size";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";

import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

// Register the plugins
registerPlugin(FilePondPluginImagePreview);
registerPlugin(FilePondPluginFileValidateType);
registerPlugin(FilePondPluginImageValidateSize);
registerPlugin(FilePondPluginFileValidateSize);

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
        className="h-36"
        files={files}
        onupdatefiles={setFiles}
        allowMultiple={false}
        maxFiles={1}
        server="/api/image-upload"
        id={name}
        name={name}
        required={required}
        credits={false}
        labelIdle='Drag & Drop your image or <span class="filepond--label-action">Browse</span>'
        acceptedFileTypes={["image/png", "image/jpeg"]}
        labelFileTypeNotAllowed="Invalid file type. Please only upload images of JPEG and PNG format"
        imageValidateSizeMinWidth={1800}
        imageValidateSizeMinHeight={1450}
        maxFileSize="5MB"
      />
      <label className="label-description" htmlFor="altText">
        Description of image for accessibility*
      </label>
      <input
        type="string"
        id="altText"
        name="altText"
        className="pill-input"
        required
      />
    </div>
  );
}
