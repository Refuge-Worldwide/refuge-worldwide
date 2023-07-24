import { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import InputField from "../components/formFields/inputField";
import MultiSelectField from "../components/formFields/multiSelectField";
import TextareaField from "../components/formFields/textareaField";
import RadioField from "../components/formFields/radioField";
import { AiOutlineInfoCircle } from "react-icons/ai";

const initialValues = {
  workshop: "",
  name: "",
  pronouns: "",
  email: "",
  number: "",
  datetime: "",
  minority: "",
  experience: "",
  experienceExplained: "",
  hear: "",
};

const workshops = [
  {
    value: "Control Club, Bucharest",
    label: "Sept 16, 8-10pm - Control Club, Bucharest",
    additionalInfo:
      "Hosted by Via PRG, this workshop will be given in Romanian",
  },
  {
    value: "Arkaoda, Istanbul",
    label: "Sept 22, 8-10pm - Arkaoda, Istanbul",
    additionalInfo:
      "Hosted by Ece Özel, this workshop will be given in Turkish",
  },
  {
    value: "Horoom, Bassiani, Tbilisi",
    label: "Sept 23, 8-10pm - Horoom, Bassiani, Tbilisi",
  },
];

const validationSchema = [
  Yup.object().shape({
    email: Yup.string()
      .email("Invalid email")
      .required("Please provide your email address"),
  }),
];

export default function TourWorkshopForm() {
  const [submissionError, setSubmissionError] = useState<boolean>(false);
  const _handleSubmit = async (values, actions) => {
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
      actions.setSubmitting(false);
    } else if (response.ok) {
      // successful
      console.log("form submitted successfully");
      actions.setSubmitting(false);
    } else {
      // unknown error
      actions.setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      // validationSchema={validationSchema}
      onSubmit={_handleSubmit}
    >
      {({ values, isSubmitting }) => (
        <Form id="showSubmissionForm">
          {/* <pre className="text-white bg-black p-4">
            {JSON.stringify(values, null, 2)}
          </pre> */}
          <MultiSelectField
            name="workshop"
            label="Please select a workshop"
            limit={1}
            options={workshops}
            required={true}
          />
          {values.workshop.additionalInfo && (
            <div className="flex gap-2 items-center border border-black p-3 lg:p-6 mb-10 bg-orange">
              <AiOutlineInfoCircle />
              <p>{values.workshop.additionalInfo}</p>
            </div>
          )}
          <InputField
            name="name"
            type="text"
            label="Your name"
            required={true}
          />
          <InputField
            name="pronouns"
            type="text"
            label="Pronouns"
            required={true}
          />
          <InputField
            name="email"
            type="email"
            label="Email address"
            required={true}
          />
          <InputField
            name="number"
            type="text"
            label="Phone Number"
            required={true}
          />
          <div className="border border-black p-6 mb-10">
            <fieldset>
              <legend className="sm:mt-0.5 text-small sm:text-base sm:leading-none">
                Priority will be given to those with refugee backgrounds, BIPoC,
                people from the LGBTQIA community, disabled people, women, trans
                and non-binary people, or anyone else who feels that due to
                their background, they face difficulties accessing music
                education in Berlin. Do you identify as any of the above, or
                have another reason that you need help accessing music
                education? If you want to explain a bit more about your identity
                or background, you can select &ldquo;other&rdquo; and add some
                more details. This information will be treated confidentially.*
              </legend>
              <div
                role="group"
                aria-labelledby="my-radio-group"
                className="flex flex-col"
              >
                {/* <RadioField name="minority" label="Yes" value="Yes" /> */}
                <label className="space-x-3 text-base flex items-center">
                  <Field
                    className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
                    type="radio"
                    name="minority"
                    value="Yes"
                  />
                  <span>Yes</span>
                </label>
                <label className="space-x-3 text-base flex items-center">
                  <Field
                    className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
                    type="radio"
                    name="minority"
                    value="No"
                  />
                  <span>No</span>
                </label>
                <label className="space-x-3 text-base flex items-center">
                  <Field
                    className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
                    type="radio"
                    name="minority"
                    value="Other"
                  />
                  <span>Other</span>
                </label>
                {values.minority == "Other" && (
                  <TextareaField name="priorityDesc" rows={2} />
                )}
              </div>
            </fieldset>
          </div>
          <div className="border border-black p-6 mb-10">
            <fieldset>
              <legend className="sm:mt-0.5 text-small sm:text-base sm:leading-none">
                Please note that this workshop is designed for people that
                already have some DJ experience.*
              </legend>
              <div
                role="group"
                aria-labelledby="my-radio-group"
                className="flex flex-col"
              >
                <label className="space-x-3 text-base flex items-center">
                  <Field
                    className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
                    type="radio"
                    name="experience"
                    value="Yes, I have some experience"
                  />
                  <span>Yes, I have some experience</span>
                </label>
                <label className="space-x-3 text-base flex items-center">
                  <Field
                    className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
                    type="radio"
                    name="experience"
                    value="No, I am a beginner"
                  />
                  <span>No, I am a beginner</span>
                </label>
              </div>
            </fieldset>
          </div>
          <TextareaField
            rows={4}
            name="experienceExplained"
            label="As this workshop is for intermediate DJs, we would like to know a little bit more about your experience and why you want to join this workshop."
            required={true}
          />
          <InputField
            name="hear"
            type="text"
            label="How did you hear about these workshops?"
            required={true}
          />
          {isSubmitting && <p className="animate-pulse">Submitting form...</p>}
          {submissionError && !isSubmitting && (
            <p className="text-red">
              Sorry there has been an error submitting this form, please try
              again and if this problem persists get in touch.
            </p>
          )}
        </Form>
      )}
    </Formik>
  );
}
