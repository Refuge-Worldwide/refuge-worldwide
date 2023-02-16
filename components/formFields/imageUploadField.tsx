import React, { useState } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import { useField, useFormikContext } from "formik";
import { serverOptions } from "./filepondServer";

import "filepond/dist/filepond.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";

import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

// Register the plugins
registerPlugin(FilePondPluginImagePreview);
registerPlugin(FilePondPluginFileValidateType);
registerPlugin(FilePondPluginFileValidateSize);

const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_MANAGEMENT_ACCESS_TOKEN;
const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
// const environmentId = "submission-sandbox";

// Our app
export default function ImageUploadField({
  label,
  ...props
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  const [field, meta, helpers] = useField(props);
  const { setFieldValue } = useFormikContext();

  // const setFieldValue(field, value){
  const imageUploaded = (file) => {
    const image = {
      filename: file.filename,
      type: file.fileType,
      url: file.serverId,
    };

    setFieldValue(props.name, image);
  };

  return (
    <div className="mb-10">
      <label htmlFor={props.name}>
        {label}
        {props.required && "*"}
        <span className="label-description">
          Landscape format, 1800x1450px or larger, 5MB max, no HEIC. Please
          include show and host names in filename.
        </span>
      </label>
      <FilePond
        {...field}
        {...props}
        className="min-h-36"
        // files={files}
        allowMultiple={false}
        credits={false}
        server={serverOptions}
        onprocessfile={(error, file) => {
          console.log(file);
          imageUploaded(file);
        }}
        labelIdle='Drag & Drop your image or <span class="filepond--label-action">Browse</span>'
        acceptedFileTypes={["image/png", "image/jpeg"]}
        labelFileTypeNotAllowed="Invalid file type. Please only upload images of JPEG and PNG format"
        maxFileSize="5MB"
      />
      {meta.touched && meta.error ? (
        <span className="text-red mt-2">{meta.error}</span>
      ) : null}
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
