import React, { useState } from "react";
import ReactDOM from "react-dom";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
// import SingleLineField from './singleLineField'

// Import the Image EXIF Orientation and Image Preview plugins
// Note: These need to be installed separately
// `npm i filepond-plugin-image-preview filepond-plugin-image-exif-orientation --save`
// import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

// Register the plugins
registerPlugin(FilePondPluginImagePreview);

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
      </label>
      <FilePond
        className="h-56"
        files={files}
        onupdatefiles={setFiles}
        allowMultiple={false}
        maxFiles={1}
        server="/api/image-upload"
        id={name}
        name={name}
        required={required}
        credits={false}
        labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
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
