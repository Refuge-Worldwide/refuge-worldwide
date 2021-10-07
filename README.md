# Refuge Worldwide

[![Powered by Vervel](/powered-by-vercel.svg)](https://vercel.com/?utm_source=refugeworldwide&utm_campaign=oss)

The [refugeworldwide.com](https://refugeworldwide.com) website, built with Next.js & Tailwind CSS, deployed on Vercel.

The site is using Contentful as our CMS backend, and at build we're statically generating the the top Shows, Articles, and Artist pages, any page that gets added in the CMS or is updated is added on the fly using Next.js's ISR feature.

## Contributing

We're always looking for ways to improve the performance and accessibility of the site so feel free to open a PR and help out!

## Next.js

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

### Getting Started

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
