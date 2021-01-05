import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Arrow } from "../icons/arrow";

type FormValues = {
  email: string;
  optIn: boolean;
};

export default function Subscribe() {
  const [message, setMessage] = useState("");

  const { register, handleSubmit, reset } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { email } = data;

    // 3. Send a request to our API with the user's email address.
    const res = await fetch("/api/subscribe", {
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    const { error } = await res.json();

    if (error) {
      // 4. If there was an error, update the message in state.
      setMessage(error);

      return;
    }

    // 5. Clear the input value and show a success message.
    reset();
    setMessage("Success! 🎉 You are now subscribed to the newsletter.");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} method="POST">
      <div>
        <label className="block font-medium" htmlFor="email">
          Register here
        </label>

        <div className="h-5" />

        <input
          className="pill-input"
          autoComplete="off"
          id="email"
          name="email"
          placeholder="Your Email"
          type="email"
          ref={register({ required: true })}
        />
      </div>

      <div className="h-5" />

      <div>
        <label
          className="flex sm:items-center space-x-3 text-small"
          htmlFor="optIn"
        >
          <input
            className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
            id="optIn"
            name="optIn"
            type="checkbox"
            ref={register({ required: true })}
          />{" "}
          <span className="sm:mt-0.5 sm:leading-none">
            I consent to receive emails from Refuge Worldwide
          </span>
        </label>
      </div>

      <div className="h-5" />

      <div>
        <button className="inline-flex items-center space-x-4 text-base font-medium">
          <span className="underline">Submit</span>
          <Arrow />
        </button>
      </div>

      <div className="h-5" />

      <div className="text-small">{message}</div>
    </form>
  );
}
