import { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import InputField from "../components/formFields/inputField";
import MultiSelectField from "../components/formFields/multiSelectField";
import TextareaField from "../components/formFields/textareaField";
import RadioField from "../components/formFields/radioField";
import { AiOutlineInfoCircle, AiOutlineLoading3Quarters } from "react-icons/ai";
import { Arrow } from "../icons/arrow";

const initialValues = {
  workshop: "",
  name: "",
  pronouns: "",
  email: "",
  number: "",
  background: "",
  backgroundOther: "",
  experience: "",
  experienceExplained: "",
  hear: "",
};

const workshops = [
  {
    value: "Control Club, Bucharest",
    label: "Sept 16, 2000-2200 — Control Club, Bucharest",
    additionalInfo:
      "Hosted by Via PRG, this workshop will be given in Romanian.",
  },
  {
    value: "Arkaoda, Istanbul",
    label: "Sept 22, 2000-2200 — Arkaoda, Istanbul x Root Radio",
    additionalInfo:
      "Hosted by Ece Özel, this workshop will be given in Turkish.",
  },
  {
    value: "Horoom, Bassiani, Tbilisi",
    label: "Sept 23, 2000-2200 — Horoom, Bassiani, Tbilisi",
    additionalInfo: "This workshop will be given in English.",
  },
  {
    value: "Arkaoda, Berlin",
    label: "Sept 30, 2000-2200 — Arkaoda, Berlin",
    additionalInfo:
      "Hosted by The Neighbourhood Character, this workshop will be vinyl only and will be given in English.",
  },
  {
    value: "Corsica Studios, London",
    label: "Oct 07, 2000-2200 — Corsica Studios, London",
    additionalInfo:
      "This workshop will be given in English. In collaboration with Rhythm Section.",
  },
  {
    value: "European Lab, Brussels",
    label: "Oct 13, 2000-2200 — European Lab, Brussels",
    additionalInfo:
      "Hosted by Chloe Lula, this workshop will be given in English.",
  },
  {
    value: "Pleasure Control, Copenhagen",
    label: "Oct 13, 2000-2200 — Pleasure Control, Copenhagen",
    additionalInfo:
      "Hosted by Shanti Celeste, this workshop will be given in English.",
  },
  {
    value: "De School, Amsterdam",
    label: "Oct 20, 2000-2200 — De School, Amsterdam",
    additionalInfo: "This workshop will be given in English.",
  },
  {
    value: "Gewölbe, Cologne",
    label: "Oct 20, 2100-2300 — Gewölbe, Cologne",
    additionalInfo: "Hosted by AGY3NA, This workshop will be given in German.",
  },
  {
    value: "Bunker, Torin",
    label: "Oct 21, 2100-2300 — Bunker, Torino",
    additionalInfo: "Hosted by Andrea, This workshop will be given in Italian.",
  },
  {
    value: "Jasna1, Warsaw",
    label: "Nov 4, 2200-000 — Jasna1, Warsaw",
    additionalInfo:
      "Hosted by Mala Herba, This workshop will be given in Italian. In collaboration with Oramics.",
  },
  {
    value: "Funke, Ghent",
    label: "Nov 11, 2100-2300 — Funke, Ghent",
    additionalInfo:
      "Hosted by Stella Zekri , this workshop will be vinyl only and will be given in English and French.",
  },
  {
    value: "Lux, Lisbon",
    label: "Nov 25, 2100-2300 — Lux, Lisbon",
    additionalInfo:
      "Hosted by Yen Sung, this workshop will be vinyl only and will be given in Portuguese.",
  },
  {
    value: "C12, Brussels",
    label: "Dec 01, 2000-2200 — C12, Brussels",
    additionalInfo:
      "This workshop will be given in English. In collaboration with Kiosk Radio.",
  },
  {
    value: "La Marbrerie, Paris",
    label: "Dec 02, 2100-2300 — La Marbrerie, Paris",
    additionalInfo:
      "Hosted by DJ Fart In The Club, this workshop will be given in English.",
  },
  {
    value: "Panorama Bar, Berlin",
    label: "Dec 08, 1300-1500 — Panorama Bar, Berlin",
    additionalInfo:
      "Hosted by JADALAREIGN, this workshop will be given in English.",
  },
];

const validationSchema = Yup.object().shape({
  workshop: Yup.object().required("Please select a workshop"),
  name: Yup.string().required("Please provide your name"),
  pronouns: Yup.string().required("Please provide your pronouns"),
  email: Yup.string()
    .email("Invalid email")
    .required("Please provide your email address"),
  number: Yup.string().required("Please provide your number"),
  background: Yup.string().required("Please select an option above"),
  experience: Yup.string().required("Please select an option above"),
  experienceExplained: Yup.string().required("This field is required"),
  hear: Yup.string().required("This field is requied"),
});

export default function TourWorkshopForm() {
  const [submissionError, setSubmissionError] = useState<boolean>(false);
  const _handleSubmit = async (values, actions) => {
    console.log("submitting the form");
    console.log(values);
    const JSONData = JSON.stringify(values);
    const endpoint = "/api/carhartt-wip-tour-submission";
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
      actions.setStatus("submitted");
    } else {
      // unknown error
      actions.setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={_handleSubmit}
    >
      {({ values, isSubmitting, status }) => (
        <div>
          {status == "submitted" ? (
            <div>
              <p className="font-medium">Submission successful.</p>
            </div>
          ) : (
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
                <div className="flex gap-2 md:gap-3 items-center border border-black p-3 md:p-6 mb-10 bg-orange">
                  <AiOutlineInfoCircle className="w-5 sm:w-6 md:w-8 h-full" />
                  <p className="flex-1">{values.workshop.additionalInfo}</p>
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
                  <legend className="sm:mt-0.5 mb-4 text-small sm:text-base">
                    Priority will be given to those with refugee backgrounds,
                    BIPoC, people from the LGBTQIA community, disabled people,
                    women, trans and non-binary people, or anyone else who feels
                    that due to their background, they face difficulties
                    accessing music education in Berlin. Do you identify as any
                    of the above, or have another reason that you need help
                    accessing music education? If you want to explain a bit more
                    about your identity or background, you can select
                    &ldquo;other&rdquo; and add some more details. This
                    information will be treated confidentially.*
                  </legend>
                  <div
                    role="group"
                    aria-labelledby="my-radio-group"
                    className="flex flex-col"
                  >
                    {/* <RadioField name="background" label="Yes" value="Yes" /> */}
                    <label className="space-x-3 text-base flex items-center">
                      <Field
                        className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
                        type="radio"
                        name="background"
                        value="Yes"
                      />
                      <span className="text-small sm:text-base">Yes</span>
                    </label>
                    <label className="space-x-3 text-base flex items-center">
                      <Field
                        className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
                        type="radio"
                        name="background"
                        value="No"
                      />
                      <span className="text-small sm:text-base">No</span>
                    </label>
                    <label className="space-x-3 text-base flex items-center">
                      <Field
                        className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
                        type="radio"
                        name="background"
                        value="Other"
                      />
                      <span className="text-small sm:text-base">Other</span>
                    </label>
                    {values.background == "Other" && (
                      <TextareaField name="backgroundOther" rows={2} />
                    )}
                  </div>
                </fieldset>
              </div>
              <div className="border border-black p-6 mb-10">
                <fieldset>
                  <legend className="sm:mt-0.5 mb-4 text-small sm:text-base">
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
                      <span className="text-small sm:text-base">
                        Yes, I have some experience
                      </span>
                    </label>
                    <label className="space-x-3 text-base flex items-center">
                      <Field
                        className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
                        type="radio"
                        name="experience"
                        value="No, I am a beginner"
                      />
                      <span className="text-small sm:text-base">
                        No, I am a beginner
                      </span>
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
              <div>
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="inline-flex items-center space-x-4 text-base font-medium mt-6"
                >
                  <span className="underline">
                    {isSubmitting ? "Submitting" : "Submit"}
                  </span>
                  {!isSubmitting && <Arrow />}
                  {isSubmitting && (
                    <AiOutlineLoading3Quarters className="animate-spin" />
                  )}
                </button>
              </div>
              {submissionError && !isSubmitting && (
                <p className="text-red">
                  Sorry there has been an error submitting this form, please try
                  again and if this problem persists get in touch.
                </p>
              )}
            </Form>
          )}
        </div>
      )}
    </Formik>
  );
}
