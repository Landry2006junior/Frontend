This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

## Run locally

Start MongoDB, then run the API and frontend in separate terminals:

```bash
# Terminal 1: API
cd C:\landry\backend
npm install
npm start

# Terminal 2: frontend
cd C:\landry\frontend\frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If that port is occupied,
Next.js will choose another available port; local development CORS permits
localhost origins. The API defaults to `http://localhost:5000/api`.

The backend connects to `mongodb://localhost:27017/reactsec` by default and
creates the database collections on startup. Set `MONGODB_URI` to use a
different MongoDB database, `FRONTEND_ORIGINS` to a comma-separated list of
deployed frontend origins, or `NEXT_PUBLIC_API_BASE` to point the frontend at a
different API URL.

For development, run the frontend with:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
