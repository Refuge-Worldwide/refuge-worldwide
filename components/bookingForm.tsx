import { FormEvent, Fragment, useState } from "react";
import { Arrow } from "../icons/arrow";

export default function BookingPasswordForm({
  bookingPassword,
  onPasswordCorrect,
}: {
  bookingPassword: string;
  onPasswordCorrect: () => void;
}) {
  const [message, setMessage] = useState<string>();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const target = event.target as typeof event.target & {
        password: { value: string };
      };

      if (target.password.value === bookingPassword) {
        onPasswordCorrect();

        return;
      }

      throw new Error("Incorrect Password");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div>
      <form method="POST" onSubmit={onSubmit}>
        <div>
          <div>
            <label className="block font-medium" htmlFor="password">
              Enter your password
            </label>

            <div className="h-5" />

            <input
              autoComplete="off"
              className="pill-input"
              id="password"
              name="password"
              placeholder="Password"
              required
              type="password"
              allow-1password="no"
            />
          </div>

          <div className="h-5" />

          <div>
            <button
              type="submit"
              className="inline-flex items-center space-x-4 text-base font-medium"
            >
              <span className="underline">Submit</span>
              <Arrow />
            </button>
          </div>
        </div>
      </form>

      {message && (
        <Fragment>
          <div className="h-5" />

          <div className="text-small text-red">{message}</div>
        </Fragment>
      )}
    </div>
  );
}
