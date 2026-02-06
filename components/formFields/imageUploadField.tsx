import React, { useState, useEffect } from "react";
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
  multi = false,
  description,
  value,
  ...props
}: {
  label: string;
  name: string;
  multi?: boolean;
  required?: boolean;
  description?: string;
  value?: any;
}) {
  const [field, meta, helpers] = useField(props);
  const { values, setFieldValue, setSubmitting } = useFormikContext<any>();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (value) {
      let initialImages;
      if (multi) {
        initialImages = value.map((image) => ({
          source: image.url,
          options: {
            type: "local",
          },
        }));
      } else {
        initialImages = [
          {
            source: value.url,
            options: {
              type: "local",
            },
          },
        ];
      }
      setFiles(initialImages);
    }
  }, []);

  // const setFieldValue(field, value){
  const imageUploaded = (file) => {
    // Parse the response from Contentful upload
    let uploadData;
    try {
      uploadData = JSON.parse(file.serverId);
    } catch (e) {
      // Fallback for old format (just URL string)
      uploadData = { url: file.serverId };
    }

    // Ensure URL uses https protocol
    let url = uploadData.url;
    if (url.startsWith("http://")) {
      url = url.replace("http://", "https://");
    } else if (url.startsWith("//")) {
      url = `https:${url}`;
    }

    const image = {
      id: uploadData.id, // Store the Contentful asset ID
      filename: file.filename,
      type: file.fileType,
      url: url,
    };
    if (multi) {
      let images = values[props.name];
      images.push(image);
      setFieldValue(props.name, images);
    } else {
      setFieldValue(props.name, image);
    }
  };

  const _reorderDeleteHandler = (files) => {
    console.log(files);
    const processed = files.map((file) => {
      return {
        filename: file.filename,
        type: file.fileType,
        url: file.serverId,
      };
    });
    setFieldValue(props.name, processed);
  };

  return (
    <div className={`mb-10 ${multi ? "multi" : null}`}>
      <label htmlFor={props.name}>
        {label}
        {props.required && "*"}
        <span className="label-description">
          {description
            ? description
            : "Minimum dimensions: 1000x1000px, maximum file size: 2MB."}
        </span>
      </label>
      <FilePond
        {...field}
        {...props}
        className="min-h-36"
        files={files}
        allowMultiple={multi}
        credits={false}
        server={serverOptions}
        onprocessfile={(error, file) => {
          imageUploaded(file);
        }}
        onreorderfiles={(files) => {
          if (multi) {
            _reorderDeleteHandler(files);
          }
        }}
        onupdatefiles={(files) => {
          setFiles(files);
          // only fire handler when image is removed.
          if (files.length < values.image.length) {
            _reorderDeleteHandler(files);
          }
        }}
        onprocessfilestart={() => {
          console.log("uploading");
          setSubmitting(true);
        }}
        onprocessfiles={() => {
          setSubmitting(false);
        }}
        allowReorder={multi}
        labelIdle='Drag & Drop your image or <span class="filepond--label-action">Browse</span>'
        acceptedFileTypes={["image/png", "image/jpeg"]}
        labelFileTypeNotAllowed="Invalid file type. Please only upload images of JPEG and PNG format"
        maxFileSize="2MB"
        labelMaxFileSizeExceeded="Image is too large. 2MB is the maximum file size."
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
      {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
    </div>
  );
}
