import ShowSubmissionStep1 from "./showSubmissionStep1";
import ShowSubmissionStep2 from "./showSubmissionStep2";
import ShowSubmissionStep3 from "./showSubmissionStep3";
import { Arrow } from "../icons/arrow";
import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";

interface SubmissionFormValues {
  showType: string;
  readInfo: Boolean;
  email: string;
  number: number;
  name: string;
  date: string;
  genres: Array<{ value: string; label: string }>;
  description: string;
  instagram: string;
  showImage: string;
  additionalEq?: boolean;
  additionalEqDesc?: string;
  artists?: Array<{ value: string; label: string }>;
  extraArtists?: Array<{ name: string; bio: string }>;
}

const validationSchema = [
  Yup.object().shape({
    showType: Yup.string().required("Please choose your show type"),
  }),
  Yup.object().shape({
    readInfo: Yup.boolean().oneOf(
      [true],
      "Please confirm you have read the info above."
    ),
  }),
  Yup.object().shape({
    email: Yup.string()
      .email("Invalid email")
      .required("Please provide your email address"),
    name: Yup.string().required("Please provide a show name"),
    date: Yup.string().required("Please choose a date for your show"),
    genres: Yup.array()
      .of(
        Yup.object().shape({
          value: Yup.string(),
          label: Yup.string(),
        })
      )
      .required("Please choose some genres for your show (max 3)"),
    description: Yup.string().required("Please add a show description"),
    // showImage: Yup.string().required("Please upload an image for your show"),
    artists: Yup.array().of(
      Yup.object().shape({
        value: Yup.string(),
        label: Yup.string(),
      })
    ),
    // extraArtists: Yup.array().of(
    //   Yup.object().shape({
    //     name: Yup.string().required('Please add an artist name'),
    //     bio: Yup.string().required('Please add an artist bio'),
    //     guestImage: Yup.string().required('Please add a image')
    //   })
    // )
  }),
];

const initialValues = {
  showType: "",
  readInfo: false,
  name: "",
  date: "",
  genres: [],
  description: "",
  instagram: "",
  showImage: "",
  artists: [],
  showExtraArtists: false,
  extraArtists: [
    {
      name: "",
      bio: "",
      image: "",
    },
  ],
};

export default function ShowSubmissionForm({
  genres,
  artists,
  uploadLink,
  importantInfo,
}) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const isLastStep = currentStep === 2;
  const currentValidationSchema = validationSchema[currentStep];

  const _handleSubmit = (values, actions) => {
    if (isLastStep) {
      console.log("its the last step");
      _submitForm(values, actions);
    } else {
      const form = document.getElementById("submission-form");
      form.scrollIntoView({ behavior: "smooth" });
      setCurrentStep(currentStep + 1);
    }
  };

  const _handleBack = () => {
    const form = document.getElementById("submission-form");
    form.scrollIntoView({ behavior: "smooth" });
    setCurrentStep(currentStep - 1);
  };

  const _submitForm = async (values, actions) => {
    console.log("submitting the form");
    console.log(values);
    const JSONData = JSON.stringify(values);
    const endpoint = "/api/show-submission";
    const options = {
      // The method is POST because we are sending data.
      method: "POST",
      // Tell the server we're sending JSON.
      headers: {
        "Content-Type": "application/json",
      },
      // Body of the request is the JSON data we created above.
      body: JSONData,
    };
    const response = await fetch(endpoint, options);
    if (response.status === 400) {
      // Validation error
    } else if (response.ok) {
      // successful
      console.log("form submitted successfully");
      actions.setSubmitting(false);
    } else {
      // unknown error
    }
  };

  const step = (values) => {
    switch (currentStep) {
      case 0:
        return <ShowSubmissionStep1 />;
      case 1:
        return (
          <ShowSubmissionStep2
            importantInfo={importantInfo}
            showType={values.showType}
          />
        );
      case 2:
        return (
          <ShowSubmissionStep3
            showType={values.showType}
            genres={genres}
            artists={artists}
            values={values}
            uploadLink={uploadLink}
          />
        );
      default:
        return <ShowSubmissionStep1 />;
    }
  };

  return (
    <div id="submission-form" className="min-h-1/2">
      <div className="flex items-center justify-center space-x-4 text-small">
        <button
          onClick={() => setCurrentStep(0)}
          disabled={currentStep == 0}
          className={currentStep == 0 ? "font-medium" : ""}
        >
          1. Live / Pre-record
        </button>
        <Arrow />
        <button
          onClick={() => setCurrentStep(1)}
          disabled={currentStep <= 1}
          className={currentStep == 1 ? "font-medium" : ""}
        >
          2. Important info
        </button>
        <Arrow />
        <span className={currentStep == 2 ? "font-medium" : ""}>
          3. Submission
        </span>
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={currentValidationSchema}
        onSubmit={_handleSubmit}
      >
        {({ values }) => (
          <Form id="showSubmissionForm">
            {step(values)}
            <div className="flex space-x-6">
              {currentStep !== 0 && (
                <button
                  onClick={_handleBack}
                  type="button"
                  className="inline-flex items-center space-x-4 text-base font-medium mt-6 opacity-50"
                >
                  <Arrow className="rotate-180" />
                  <span className="underline">Back</span>
                </button>
              )}
              <div>
                <button
                  type="submit"
                  className="inline-flex items-center space-x-4 text-base font-medium mt-6"
                >
                  <span className="underline">
                    {isLastStep ? "Submit" : "Next"}
                  </span>
                  <Arrow />
                </button>
              </div>
              {/* {isSubmitting && <p>Submitting your form...</p>} */}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
