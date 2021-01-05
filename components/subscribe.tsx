export default function Subscribe() {
  const onSubmit = async (data: { email: string }) => {
    const { email } = data;
  };

  return (
    <form method="POST">
      <div>
        <label htmlFor="email">Register here</label>
        <input id="email" name="email" type="email" placeholder="Your Email" />
      </div>

      <div>
        <label htmlFor="optIn">
          <input type="checkbox" name="optIn" id="optIn" /> I consent to receive
          emails from Refuge Worldwide
        </label>
      </div>

      <div>
        <button type="submit">Submit</button>
      </div>
    </form>
  );
}
