import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import InputField from "../components/formFields/inputField";
import MultiSelectField from "../components/formFields/multiSelectField";
import TextareaField from "../components/formFields/textareaField";
import { AiOutlineInfoCircle, AiOutlineLoading3Quarters } from "react-icons/ai";
import { Arrow } from "../icons/arrow";
import GDPR from "../components/formFields/gdpr";

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
    label: "Sept 16 — Control Club, Bucharest",
    additionalInfo:
      "Hosted by Vio PRG from 8-10PM, this workshop will be given in Romanian.",
  },
  {
    value: "Arkaoda, Istanbul",
    label: "Sept 22 — Arkaoda, Istanbul",
    additionalInfo:
      "Hosted by Ece Özel from 8-10PM, this workshop will be given in Turkish. In collaboration with Root Radio.",
  },
  {
    value: "Horoom, Bassiani, Tbilisi",
    label: "Sept 23 — Horoom, Bassiani, Tbilisi",
    additionalInfo:
      "Hosted by Dito from 10-12PM, this workshop will be given in Georgian.",
  },
  {
    value: "Arkaoda, Berlin",
    label: "Sept 30 — Arkaoda, Berlin",
    additionalInfo:
      "Hosted by The Neighbourhood Character from 8-10PM, this workshop will be vinyl only and will be given in English.",
  },
  {
    value: "Corsica Studios, London",
    label: "Oct 7 — Corsica Studios, London",
    additionalInfo:
      "Hosted by LAANI from 8-10PM, This workshop will be given in English. In collaboration with Rhythm Section.",
  },
  {
    value: "Reset, Brussels",
    label: "Oct 13 — Reset, Brussels",
    additionalInfo:
      "Hosted by Blck Mamba from 4-6pm, this workshop will be given in Dutch and English.",
  },
  {
    value: "Motopol, Copenhagen",
    label: "Oct 13 — Motopol, Copenhagen",
    additionalInfo:
      "Hosted by Fruit DJ from 8-10PM, this workshop will be given in English. In collaboration with Pleasure Control.",
  },
  {
    value: "De School, Amsterdam",
    label: "Oct 20 — De School, Amsterdam",
    additionalInfo:
      "Hosted by Jesse G from 8-10PM, this workshop will be given in English. Please note: this workshop is on the 20th October, while the Refuge takeover of the café at De School is on the 22nd October.",
  },
  {
    value: "Gewölbe, Cologne",
    label: "Oct 20 — Gewölbe, Cologne",
    additionalInfo:
      "Hosted by AGY3NA from 8.30-10.30PM, This workshop will be given in German.",
  },
  {
    value: "Bunker, Turin",
    label: "Oct 21 — Bunker, Turin",
    additionalInfo:
      "Hosted by Andrea from 9-11PM, This workshop will be given in Italian. In collaboration with La Notte.",
  },
  {
    value: "Jasna1, Warsaw",
    label: "Nov 4 — Jasna1, Warsaw",
    additionalInfo:
      "Hosted by Mala Herba from 8-10PM, This workshop is about MUSIC PRODUCTION, not DJing, and will be given in Polish. In collaboration with Oramics.",
  },
  {
    value: "Funke, Ghent",
    label: "Nov 11 — Funke, Ghent",
    additionalInfo:
      "Hosted by Stella Zekri from 9-11PM, this workshop will be vinyl only and will be given in English and French.",
  },
  {
    value: "Lux, Lisbon",
    label: "Nov 25 — Lux, Lisbon",
    additionalInfo:
      "Hosted by Yen Sung from 9-11PM, this workshop will be given in Portuguese.",
  },
  {
    value: "C12, Brussels",
    label: "Dec 1 — C12, Brussels",
    additionalInfo:
      "Hosted by Nathalie Seres from 9-11PM, this workshop will be given in English. In collaboration with Kiosk Radio.",
  },
  {
    value: "La Marbrerie, Paris",
    label: "Dec 2 — La Marbrerie, Paris",
    additionalInfo:
      "Hosted by DJ Fart In The Club from 7-9PM, this workshop will be given in English. In collaboration with HORS-SOL.",
  },
  {
    value: "Oona Bar, Berlin",
    label: "Dec 8 — Oona Bar, Berlin",
    additionalInfo:
      "Hosted by JADALAREIGN from 1-3PM, this workshop will be given in English.",
  },
];

const closed = [
  "Control Club, Bucharest",
  "Arkaoda, Berlin",
  "Arkaoda, Istanbul",
  "Horoom, Bassiani, Tbilisi",
  "Corsica Studios, London",
  "Reset, Brussels",
  "Motopol, Copenhagen",
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
  gdpr: Yup.boolean().required(),
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
              <p className="font-medium">
                Submission successful. Thank you for your interest, we will be
                in touch as soon as possible.
              </p>
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
              {closed.includes(values.workshop.value) && (
                <div className="flex gap-2 md:gap-3 items-center border border-black p-3 md:p-6 mb-10 bg-orange">
                  <AiOutlineInfoCircle className="w-5 sm:w-6 md:w-8 h-full" />
                  <p className="flex-1">
                    Thank you for your interest. Unfortunately applications for
                    this workshop are now closed.
                  </p>
                </div>
              )}
              {values.workshop.additionalInfo &&
                !closed.includes(values.workshop.value) && (
                  <div className="flex gap-2 md:gap-3 items-center border border-black p-3 md:p-6 mb-10 bg-orange">
                    <AiOutlineInfoCircle className="w-5 sm:w-6 md:w-8 h-full" />
                    <p className="flex-1">{values.workshop.additionalInfo}</p>
                  </div>
                )}
              {!closed.includes(values.workshop.value) &&
                values.workshop.value && (
                  <div>
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
                        <legend className="sm:mt-0.5 mb-4 text-small sm:text-base prose">
                          <p>
                            Priority will be given to those with refugee
                            backgrounds, BIPoC, people from the LGBTQIA
                            community, disabled people, women, trans and
                            non-binary people, or anyone else who feels that due
                            to their background, they face difficulties
                            accessing music education.
                          </p>
                          <p>
                            Do you identify as any of the above, or have another
                            reason that you need help accessing music education?
                            If you want to explain a bit more about your
                            identity or background, you can select
                            &ldquo;other&rdquo; and add some more details. This
                            information will be treated confidentially.*
                          </p>
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
                            <span className="text-small sm:text-base">
                              Other
                            </span>
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
                          Please note that this workshop is designed for people
                          that already have some DJ experience.*
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
                      label="We would like to know a little bit more about your experience and why you want to join this workshop."
                      required={true}
                    />
                    <InputField
                      name="hear"
                      type="text"
                      label="How did you hear about these workshops?"
                      required={true}
                    />
                    <GDPR />
                    <div>
                      <button
                        disabled={isSubmitting}
                        type="submit"
                        className={`inline-flex items-center space-x-4 text-base font-medium mt-6 ${
                          isSubmitting && "cursor-wait"
                        }`}
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
                        Sorry there has been an error submitting this form,
                        please try again and if this problem persists get in
                        touch.
                      </p>
                    )}
                  </div>
                )}
            </Form>
          )}
        </div>
      )}
    </Formik>
  );
}
