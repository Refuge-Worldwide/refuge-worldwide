import Layout from "../../components/layout";
import PageMeta from "../../components/seo/page";

export default function SubscriptionSuccessPage() {
  return (
    <Layout>
      <PageMeta
        title="Welcome to Supporters | Refuge Worldwide"
        path="supporters/success/"
      />

      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-xl text-center">
          <div className="text-6xl mb-6">&#10003;</div>
          <h1 className="font-serif text-large mb-4">
            Thanks for supporting Refuge Worldwide!
          </h1>
          <p className="mb-8">
            You should receive a confirmation email shortly with information on
            setting your password and logging in.
          </p>

          <p className="mb-4">Make sure to download our app.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://apps.apple.com/us/app/refuge-worldwide/id6785827225"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <img
                src="/images/app-store-badge.svg"
                alt="Download on the App Store"
                className="h-14"
              />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.refugeworldwide.app&hl=en-US"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <img
                src="/images/google-play-badge.png"
                alt="Get it on Google Play"
                className="h-20"
              />
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
