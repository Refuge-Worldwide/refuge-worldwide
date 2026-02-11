import Head from "next/head";
import Layout from "../components/layout";
import PageMeta from "../components/seo/page";

export default function AppTesting() {
  const tallyEmbed = `https://tally.so/embed/?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`;
  const appVersion = "0.1.1"; // Update this with each new release

  return (
    <Layout>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <PageMeta title="App Testing | Refuge Worldwide" path="app-testing/" />

      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 sm:px-8 py-12 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-large font-bold mb-4">
              Refuge Worldwide App Testing
            </h1>
            <div className="inline-block text-small bg-white/10 border border-white/20 px-4 py-2 rounded-lg">
              <span className="opacity-70">Current Version: </span>
              <span className="font-bold">{appVersion}</span>
            </div>
          </div>

          {/* Intro */}
          <div className="mb-12 space-y-4">
            <p>
              Thank you for helping us test the new Refuge Worldwide mobile app!
            </p>
          </div>

          {/* iOS Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 border-b border-white/20 pb-2">
              iOS Testing
            </h2>
            <div className="space-y-4">
              <p>
                The iOS app is available through TestFlight, Apple&apos;s beta
                testing platform.
              </p>
              <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    Install TestFlight from the App Store if you haven&apos;t
                    already
                  </li>
                  <li>Use the link below to join the beta</li>
                  <li>
                    Open the link on your iOS device to accept the invitation
                  </li>
                  <li>Install the Refuge Worldwide app through TestFlight</li>
                </ol>
              </div>
              <div className="mt-4">
                <a
                  href=""
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-white/90 transition-colors"
                >
                  Join iOS Beta →
                </a>
              </div>
            </div>
          </section>

          {/* Android Section */}
          <section className="mb-12">
            <h2 className="font-bold mb-4 border-b border-white/20 pb-2">
              Android Testing
            </h2>
            <div className="space-y-4">
              <p>
                The Android app is available for testing via direct download.
              </p>
              <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Download the app using the link below</li>
                  <li>
                    You may need to enable &quot;Install from unknown
                    sources&quot; in your settings
                  </li>
                  <li>Install the app on your Android device</li>
                  <li>Start testing and exploring!</li>
                </ol>
              </div>
              <div className="mt-4">
                <a
                  href=""
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-white/90 transition-colors"
                >
                  Download Android Beta →
                </a>
              </div>
            </div>
          </section>

          {/* Feedback Form */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-8 border-b border-white/20 pb-2">
              Submit Feedback
            </h2>
            <p className="mb-6">
              Please share your experience, report any bugs, or suggest
              improvements:
            </p>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <iframe
                src={tallyEmbed}
                width="100%"
                height="600"
                title="App Testing Feedback Form"
                className="mb-8"
                loading="lazy"
              ></iframe>
            </div>
          </section>

          {/* Footer Note */}
          <div className="text-center text-white/60 text-sm mt-12">
            <p>Thank you!</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
