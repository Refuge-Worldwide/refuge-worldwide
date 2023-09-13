import ShowSubmissionStep1 from "./showSubmissionStep1";
import ShowSubmissionStep2 from "./showSubmissionStep2";
import ShowSubmissionStep3 from "./showSubmissionStep3";
import ShowSubmissionStep4 from "./showSubmissionStep4";
import { SubmissionFormValues } from "../types/shared";
import { Arrow } from "../icons/arrow";
import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { transformForDropdown } from "../util";

const today = new Date();
const instaReg = /^([\w.\s]+, )*([\w.\s]+){1}$/;
const listReg = /^([\w \s]+, )*([\w \s]+){1}$/;
const onTheHourReg = /.*00$/;

today.setHours(0, 0, 0, 0);

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
    number: Yup.string(),
    showName: Yup.string().required("Please provide a show name"),
    datetime: Yup.date()
      .min(today, "Date cannot be in the past")
      .required("Please choose a date for your show"),
    length: Yup.number().required("Please choose a length for your show"),
    genres: Yup.array()
      .of(
        Yup.object().shape({
          value: Yup.string(),
          label: Yup.string(),
        })
      )
      .min(1, "Please choose some genres for your show (max 3)")
      .max(3, "You can choose a max of 3 genres, please remove some")
      .required("Please choose some genres for your show (max 3)"),
    hasNewGenres: Yup.boolean(),
    newGenres: Yup.string().when("hasNewGenres", {
      is: true,
      then: (schema) =>
        schema
          .matches(
            listReg,
            "Incorrect format. Should be a comma seperated list with space."
          )
          .required("Please add additional genres"),
    }),
    description: Yup.string().required("Please add a show description"),
    instagram: Yup.string().matches(
      instaReg,
      "Incorrect format. Should be a comma seperated list with space and NOT including the @ symbol."
    ),
    image: Yup.object().required("Please add a show image"),
    hasExtraArtists: Yup.boolean(),
    artists: Yup.array().when("hasExtraArtists", {
      is: false,
      then: (schema) =>
        schema.min(
          1,
          "Please select an artist from dropdown or add a new artists by clicking checkbox below"
        ),
      otherwise: (schema) =>
        schema.of(
          Yup.object().shape({
            value: Yup.string(),
            label: Yup.string(),
          })
        ),
    }),
    extraArtists: Yup.array().when("hasExtraArtists", {
      is: true,
      then: (schema) =>
        schema.of(
          Yup.object()
            .default({})
            .shape({
              name: Yup.string().required("Please add an artist name"),
              image: Yup.object().required("Please add an artist image"),
            })
        ),
    }),
  }),
];

export default function ShowSubmissionForm({
  initial,
  genres,
  artists,
  uploadLink,
  importantInfo,
}) {
  const initialValues: SubmissionFormValues = {
    id: initial ? initial.sys.id : "",
    showType: "",
    readInfo: false,
    email: "",
    number: "",
    showName: "",
    datetime: initial ? initial.date : "",
    length: "1",
    genres: [],
    hasNewGenres: false,
    newGenres: "",
    description: "",
    instagram: "",
    image: {},
    artists: initial
      ? transformForDropdown(initial.artistsCollection.items)
      : [],
    hasExtraArtists: false,
    extraArtists: [
      {
        name: "",
        pronouns: "",
        bio: "",
        image: "",
      },
    ],
  };
  const [currentStep, setCurrentStep] = useState<number>(1);
  const isLastStep = currentStep === 2;
  const currentValidationSchema = validationSchema[currentStep];
  const [submissionError, setSubmissionError] = useState<boolean>(false);

  const _handleSubmit = (values, actions) => {
    if (isLastStep) {
      console.log("its the last step");
      _submitForm(values, actions);
    } else {
      const form = document.getElementById("submission-form");
      form.scrollIntoView({ behavior: "smooth" });
      setCurrentStep(currentStep + 1);
      actions.setTouched({});
      actions.setSubmitting(false);
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
      method: initial ? "PATCH" : "POST",
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
      actions.setSubmitting(false);
      setSubmissionError(true);
    } else if (response.ok) {
      // successful
      console.log("form submitted successfully");
      actions.setSubmitting(false);
      const form = document.getElementById("submission-form");
      form.scrollIntoView({ behavior: "smooth" });
      setCurrentStep(currentStep + 1);
    } else {
      // unknown error
      actions.setSubmitting(false);
      setSubmissionError(true);
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
            initial={initial}
            showType={values.showType}
            genres={genres}
            artists={artists}
            uploadLink={uploadLink}
          />
        );
      case 3:
        return <ShowSubmissionStep4 />;
      default:
        return <ShowSubmissionStep1 />;
    }
  };

  return (
    <div id="submission-form" className="min-h-1/2">
      <pre className="text-white bg-black">
        {JSON.stringify(initial, null, 2)}
      </pre>
      {currentStep != 3 && (
        <div className="flex flex-col md:flex-row text-center items-center justify-center space-y sm:space-y-2 md:space-y-0 md:space-x-4">
          {/* <button
            onClick={() => setCurrentStep(0)}
            disabled={currentStep == 0}
            className={currentStep == 0 ? "font-medium" : ""}
          >
            1. Live / Pre-record
          </button>
          <Arrow className="hidden md:block" /> */}
          <button
            onClick={() => setCurrentStep(1)}
            disabled={currentStep <= 1}
            className={currentStep == 1 ? "font-medium" : ""}
          >
            1. Important info
          </button>
          <Arrow className="hidden md:block" />
          <span className={currentStep == 2 ? "font-medium" : ""}>
            2. Submission
          </span>
        </div>
      )}
      <Formik
        initialValues={initialValues}
        // validationSchema={currentValidationSchema}
        onSubmit={_handleSubmit}
      >
        {({ values, isSubmitting }) => (
          <Form id="showSubmissionForm">
            {step(values)}
            {currentStep != 3 && (
              <div>
                <div className="flex space-x-6 mt-6">
                  {currentStep > 1 && (
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
                      disabled={isSubmitting}
                      type="submit"
                      className="inline-flex items-center space-x-4 text-base font-medium mt-6"
                    >
                      <span className="underline">
                        {isLastStep ? "Submit" : "Next"}
                      </span>
                      <Arrow />
                    </button>
                  </div>
                </div>
                {isSubmitting && (
                  <p className="animate-pulse">Submitting form...</p>
                )}
                {submissionError && !isSubmitting && (
                  <p className="text-red">
                    Sorry there has been an error submitting this form, please
                    try again and this problem persists get in touch.
                  </p>
                )}
              </div>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
}
