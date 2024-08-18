# Qwik City App + Cloudflare D1 with Drizzle ORM ⚡️

- [Qwik Docs](https://qwik.dev/)
- [Discord](https://qwik.dev/chat)
- [Qwik GitHub](https://github.com/QwikDev/qwik)
- [@QwikDev](https://twitter.com/QwikDev)
- [Vite](https://vitejs.dev/)
- [Cloudflare Docs](https://developers.cloudflare.com/d1/get-started/)
- [Drizzle Docs](https://developers.cloudflare.com/d1/get-started/)

---

## Project Structure

This project is using Qwik with [QwikCity](https://qwik.dev/qwikcity/overview/). QwikCity is just an extra set of tools on top of Qwik to make it easier to build a full site, including directory-based routing, layouts, and more.

Inside your project, you'll see the following directory structure:

```
├── public/
│   └── ...
└── src/
    ├── components/
    │   └── ...
    └── routes/
        └── ...
```

- `src/routes`: Provides the directory-based routing, which can include a hierarchy of `layout.tsx` layout files, and an `index.tsx` file as the page. Additionally, `index.ts` files are endpoints. Please see the [routing docs](https://qwik.dev/qwikcity/routing/overview/) for more info.

- `src/components`: Recommended directory for components.

- `public`: Any static assets, like images, can be placed in the public directory. Please see the [Vite public directory](https://vitejs.dev/guide/assets.html#the-public-directory) for more info.

## Add Integrations and deployment

Use the `npm run qwik add` command to add additional integrations. Some examples of integrations includes: Cloudflare, Netlify or Express Server, and the [Static Site Generator (SSG)](https://qwik.dev/qwikcity/guides/static-site-generation/).

```shell
npm run qwik add # or `yarn qwik add`
```

## Cloudflare

> Refrence: [Cloudflare Wrangler CLI commands](https://developers.cloudflare.com/workers/wrangler/commands/)

```shell
npm run qwik add cloudflare-pages # or `yarn qwik add cloudflare-pages`
```

As of writing this `8/17/2024` the latest cloudflare version is `3.72.0`. When running the above command it installs wrangler 3.0.0 to package.json

You will need an active cloudflare account this would be a good time to make one or login to your existing account in your web browser, you will be redirected to the browser to confirm your login from wrangler cli after running the following command.

```shell
npx wrangler login
```

You will need to have an active D1 database if you do not have one yet run the following wrangler cli command, feel free to change the name ("d1-prod-db") to anything you would like.

```shell
npx wrangler d1 create d1-prod-db
```

for the purposes of this demo we will make a second one using the same command for cloudflare preview deployments.

```shell
npx wrangler d1 create d1-preview-db
```

You can create a wrangler.toml file if you would like, you will need to copy the output of the previous two `d1 create` and paste that into the wrangler.toml file (see refrence below), or you can use wrangler cli command to generate a wrangler.toml file your current bindings by running the following command

> refrence: [Cloudflare sample wrangler.toml configuration](https://developers.cloudflare.com/workers/wrangler/configuration/#sample-wranglertoml-configuration)

```shell
npx wrangler pages download config <YOUR CLOUDFLARE PAGES PROJECT NAME>
```



## Drizzle

## Development

Development mode uses [Vite's development server](https://vitejs.dev/). The `dev` command will server-side render (SSR) the output during development.

```shell
npm start # or `yarn start`
```

> Note: during dev mode, Vite may request a significant number of `.js` files. This does not represent a Qwik production build.

## Preview

The preview command will create a production build of the client modules, a production build of `src/entry.preview.tsx`, and run a local server. The preview server is only for convenience to preview a production build locally and should not be used as a production server.

```shell
npm run preview # or `yarn preview`
```

## Production

The production build will generate client and server modules by running both client and server build commands. The build command will use Typescript to run a type check on the source code.

```shell
npm run build # or `yarn build`
```
