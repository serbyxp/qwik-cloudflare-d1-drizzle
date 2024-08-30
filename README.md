# Qwik City App + Cloudflare D1 with Drizzle ORM ⚡️

- [Qwik Docs](https://qwik.dev/)
- [Discord](https://qwik.dev/chat)
- [Qwik GitHub](https://github.com/QwikDev/qwik)
- [@QwikDev](https://twitter.com/QwikDev)
- [Vite](https://vitejs.dev/)
- [Cloudflare Docs](https://developers.cloudflare.com/d1/get-started/)
- [Drizzle Docs](https://developers.cloudflare.com/d1/get-started/)

---

## Add Integrations and deployment

Use the `npm run qwik add` command to add additional integrations. Some examples of integrations includes: Cloudflare, Netlify or Express Server, and the [Static Site Generator (SSG)](https://qwik.dev/qwikcity/guides/static-site-generation/).

```shell
npm run qwik add # or `yarn qwik add`
```

## Cloudflare | Wrangler Setup

References:

- [Cloudflare Wrangler CLI commands](https://developers.cloudflare.com/workers/wrangler/commands/)

```shell
npm run qwik add cloudflare-pages
```

As of writing this `8/17/2024` the latest cloudflare version is `3.72.0`. When running the above command it installs wrangler 3.0.0 to package.json

The version I found that works is `"wrangler": "^3.57.1"` so I suggest installing that now.

```shell
npm install -D wrangler@3.57.1
```

Sometimes the wrangler cloudflare types are automatically present but you can install them by running the following command.

```shell
npm install -D @cloudflare/workers-types
```

> This usually adds them globally no need to include them anywhere, unless something is different with your tsconfig, and or if you want to specify a specific compatibility date.

code: tsconfig.json

```json
// ./tsconfig.json
  ...
    "types": [
        "@cloudflare/workers-types/2024-0-01" // remove the date or adjust it to match the compatibility date in your projects wrangler.toml as mentioned this usually doesn't need to be added it just works when you install the types package.
    ]
  ...
```

You will need an active cloudflare account this would be a good time to make one or login to your existing account in your web browser, you will be redirected to the browser to confirm your login from wrangler cli after running the following command.

```shell
npx wrangler login
```

You will need to have an active D1 database if you do not have one yet run the following wrangler cli command, feel free to change the name ("d1-prod-db") to anything you would like.

```shell
npx wrangler d1 create d1-prod-db
```

For the purposes of this demo you can create a second one using the same command for cloudflare preview deployments.

```shell
npx wrangler d1 create d1-preview-db
```

You can create a wrangler.toml file if you would like, you will need to copy the output of the previous two `d1 create` and paste that into the wrangler.toml file (see reference below), or you can use wrangler cli command to generate a wrangler.toml file your current bindings by running the following command

References:

- [Cloudflare sample wrangler.toml configuration](https://developers.cloudflare.com/workers/wrangler/configuration/#sample-wranglertoml-configuration)

```shell
npx wrangler pages download config <PAGES PROJECT NAME>
```

I'm not exactly sure why when you run the above command it returns the `database_name = "DB"`, but keep the binding name how you named it ( all the info should be in the terminal after you ran the `wrangler d1 create ...` command)

> I get an error of DB name not found in wrangler.toml with the default generated wrangler.toml, which adds a `[[env.production.d1_databases]]` I have to remove `env.production.` from it and add `env.preview` to the original preview one. example below.

code: generated version

```toml
# Generated by Wrangler on Sat Aug 17 2024 21:52:54 GMT-0400 (Eastern Daylight Time)
name = "qwik-cloudflare-d1-drizzle"
pages_build_output_dir = "dist"
compatibility_date = "2024-08-23"

[[d1_databases]]
database_id = "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy"
binding = "DB"
database_name = "DB"

[[env.production.d1_databases]]
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
binding = "DB"
database_name = "DB"

```

code: updated to work correctly

```toml
# Generated by Wrangler on Sat Aug 17 2024 21:52:54 GMT-0400 (Eastern Daylight Time)
name = "qwik-cloudflare-d1-drizzle"
pages_build_output_dir = "dist"
compatibility_date = "2024-08-23"

[[env.preview.d1_databases]] # added env.preview.
database_id = "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy"
binding = "DB"
database_name = "db-preview-d1" # fixed the name

[[d1_databases]] # removed env.production.
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
binding = "DB"
database_name = "db-prod-d1" # fixed the name

```

Next you can import the types using the following wrangler cli command...

```shell
npx wrangler types
```

This command should create a file in your root directory called `worker-configuration.d.ts`
and should contain you cloudflare bindings. Finally you will import this into the `src/entry.cloudflare-pages.tsx` file

```typescript
// ./src/entry.cloudflare-pages.tsx

import {
  createQwikCity,
  type PlatformCloudflarePages,
} from "@builder.io/qwik-city/middleware/cloudflare-pages";
import qwikCityPlan from "@qwik-city-plan";
import { manifest } from "@qwik-client-manifest";
import render from "./entry.ssr";

declare global {
  interface QwikCityPlatform extends PlatformCloudflarePages {
    env: Env; // This is what you add no import is necessary
  }
}

const fetch = createQwikCity({ render, qwikCityPlan, manifest });

export { fetch };
```

## Vite Config

Next you need to add this to the current vite.config.ts file in the root directory. This is important to use cloudflare's proxy to work when running in dev mode ie: `npm run dev`.
Just below the last import add the following to `vite.config.ts`

```typescript
// ./vite.config.ts
... // don't add this dots existing code above , import pkg will be there also
import pkg from "./package.json";

// This is what you are adding
let platform = {};

console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV === "development") {
  const { getPlatformProxy } = await import("wrangler");
  platform = await getPlatformProxy({ persist: true });
}
... // don't add this dots ...leave existing code

export default defineConfig(({ command, mode }): UserConfig => {
  return {
    plugins: [
        qwikCity({platform}), // This is what was changed * added {platform} *
        qwikVite(),
        tsconfigPaths()
        ],
... // don't add this dots ...leave existing code
  },
})
```

That should be it for getting cloudflare environment setup and working with vite in dev mode.

## Drizzle

You can now proceed to adding Drizzle D1 support. `better-sqlite3` is added for dev mode you do not need to initialize it anywhere just have it in our `devDependencies`

```shell
npm i drizzle-orm
npm i -D better-sqlite3 drizzle-kit @types/node
```

There are several ways of getting this to work but since this is running in cloudflare things get strange. The way I found that this works well is by creating a middleware for initializing the database.

### Drizzle Config `drizzle.config.ts`

First lets create the drizzle.config.ts file in the root of your project

References:

- [Drizzle Config Docs](https://orm.drizzle.team/kit-docs/overview#configuration)
- [Cloudflare wrangler.toml D1 customization Docs](https://developers.cloudflare.com/d1/reference/migrations/#wrangler-customizations)

code: drizzle.config.ts

```typescript
// ./drizzle.config.ts
import type { Config } from "drizzle-kit";

const { LOCAL_DB_PATH, D1_ID, D1_TOKEN, CF_ACCOUNT_ID } = process.env;

// Use better-sqlite driver for local development
export default LOCAL_DB_PATH
  ? ({
      schema: "./src/database/schema.ts", // determined by you, refer to drizzle docs
      dialect: "sqlite",
      dbCredentials: {
        url: LOCAL_DB_PATH,
      },
    } satisfies Config)
  : ({
      schema: "./src/database/schema.ts", // determined by you, refer to drizzle docs
      out: "./migrations", // this should be determined by you, but different wrangler versions are "picky" (broken) and could throw some errors  refer to drizzle docs, cloudflare docs.
      dialect: "sqlite",
      driver: "d1-http",
      dbCredentials: {
        databaseId: D1_ID!,
        token: D1_TOKEN!,
        accountId: CF_ACCOUNT_ID!,
      },
    } satisfies Config);
```

### Github Ignore `.gitignore`

Now you need to create the `.drizzle.env` file here its being called `.drizzle.env`, which you will want to add to your `gitignore` while you are adding this to the `gitignore` file in the root of your projects directory you may also want to add `.wrangler` along with the `.drizzle.env`

code: .gitignore

```shell
# ./.gitignore
... # don't add this dots, leave previous

# Development
node_modules
*.local
.wrangler # add this anywhere you want.
.drizzle.env # add this anywhere you want.

...  # don't add this dots, leave previous
```

### Environment Variable File `.drizzle.env`

References:

- [Cloudflare API Token Docs](https://developers.cloudflare.com/fundamentals/api/reference/permissions/) Search for D1
- [Cloudflare Account IDs Docs](https://developers.cloudflare.com/fundamentals/setup/find-account-and-zone-ids/)

Now create the `.drizzle.env` file to your projects root.
You will need to get this information from your cloudflare dashboard.
If you don't have a D1_token you can follow the link to create it in your [Cloudflare > My Profile > API Tokens](https://dash.cloudflare.com/profile/api-tokens?permissionGroupKeys=%5B%7B%22key%22%3A%22d1%22%2C%22type%22%3A%22edit%22%7D%5D&name=d1-token&accountId=*&zoneId=all)

```shell
# ./.drizzle.env

export D1_TOKEN=aaaaaaaaaaaaaaaaaaaaaaaaaaaa
export CF_ACCOUNT_ID=bbbbbbbbbbbbbbbbbbbbbbbbbbbb
```

### Scripts `package.json`

You should add the Environment variables somewhere safe, some of the variables are not needed in a .env file since they are only used in dev mode and can be ran from the cli or `npm scripts` in our `package.json` lets add this to the bottom of our current `package.json` file under the `scripts` section

> Update the D1_ID values according to your preview and prod ID’s in the previous steps!

code: package.json

```json
"scripts": {
	"db:generate": "drizzle-kit generate",
	"db:migrate:local": "wrangler d1 migrations apply d1-prod-db --local",
	"db:migrate:prod": "wrangler d1 migrations apply d1-prod-db --remote",
	"db:migrate:preview": "wrangler d1 migrations apply --env preview d1-preview-db --remote",
	"db:studio:local": "LOCAL_DB_PATH=$(find .wrangler/state/v3/d1/miniflare-D1DatabaseObject -type f -name '*.sqlite' -print -quit) drizzle-kit studio",
	"db:studio:preview": "source .drizzle.env && D1_ID='yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy' drizzle-kit studio",
	"db:studio:prod": "source .drizzle.env && D1_ID='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' drizzle-kit studio"
}
```

The above may need to be adjusted depending on what operating system you are using for example in Windows OS using powershell

code: package.json

```json
"scripts": {
  "db:generate": "drizzle-kit generate",
  "db:migrate:local": "wrangler d1 migrations apply d1-prod-db --local",
  "db:migrate:prod": "wrangler d1 migrations apply d1-prod-db --remote",
  "db:migrate:preview": "wrangler d1 migrations apply --env preview d1-preview-db --remote",
  "db:studio:local": "powershell -Command \"$env:LOCAL_DB_PATH = (Get-ChildItem -Path .wrangler/state/v3/d1/miniflare-D1DatabaseObject -Filter *.sqlite -Recurse | Select-Object -First 1).FullName; drizzle-kit studio\"",
  "db:studio:preview": "powershell -Command \"$env:DB_ID='yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy'; $env:D1_TOKEN=(Get-Content .drizzle.env | Select-String 'D1_TOKEN=(.*)').Matches.Groups[1].Value; $env:CF_ACCOUNT_ID=(Get-Content .drizzle.env | Select-String 'CF_ACCOUNT_ID=(.*)').Matches.Groups[1].Value; drizzle-kit studio\"",
  "db:studio:prod": "powershell -Command \"$env:DB_ID='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'; $env:D1_TOKEN=(Get-Content .drizzle.env | Select-String 'D1_TOKEN=(.*)').Matches.Groups[1].Value; $env:CF_ACCOUNT_ID=(Get-Content .drizzle.env | Select-String 'CF_ACCOUNT_ID=(.*)').Matches.Groups[1].Value; drizzle-kit studio\""
}
```

### Database Directory `src/database`

Next lets create a new directory in your `./src/` for your database, you can name this or place this where ever you want in your src folder. Here you can name it `database`, create the directory `./src/database/`

> Keep in mind that in previous steps like in the [drizzle.config.ts](#drizzle.config.ts) files reference this directory so make the appropriate adjustments.

Create your schema accordingly for your project, import and export it with a "splat" to the index.ts file you can now create in our `./src/database/` directory as follows.

> Example schema provided in this Github Repo.

### Run Generate, Migrate, and Studio commands

Now run your commands to generate the database and migrations

#### Generate

```shell
npm run db:generate
```

#### Migrate local

```shell
npm run db:migrate:local
```

#### Run Drizzle Studio local

```shell
npm run db:studio:local
```

```typescript
// ./src/database/index.ts

import type { DrizzleD1Database } from "drizzle-orm/d1";
import type * as DatabaseSchema from "./schema";

export * from "./schema";

export type AppDatabase = DrizzleD1Database<typeof DatabaseSchema>;

let _db: AppDatabase;

export function getDB() {
  // eslint-disable-next-line
  if (!_db) {
    throw new Error("DB not set");
  }
  return _db;
}

export async function initializeDbIfNeeded(
  factory: () => Promise<AppDatabase>
) {
  // eslint-disable-next-line
  if (!_db) {
    _db = await factory();
  }
}
```

Create a middleware in the `./src/routes/` directory you can call it whatever you want but refer to the docs for order of invocation, based on naming (ABC order, etc...).

> You can make a `plugin@db.ts` or whatever you like. But there are certain implications when doing this, as it will always cause a worker to be executed in all paths. If you are trying to save on worker / page function executions, or are running in SSG / mixed SSG SSR. In SSG to my understanding the Cloudflare pages that are static assets do not execute a worker / page function, by having the plugin@db.ts for example will create a worker / pages function to execute in all of your routes which may be what you need, and if you are running in SSR only mode it should not make a difference as the worker / page function is probably going to be executed on each request. In a mixed SSG SSR setup you may want to isolate this in a "SSR" route/layout.tsx.

Here You will import `AppDatabase` and `initializeDbIfNeeded` from the previous step to a specific route and avoid making the `plugin@.db.ts`, the middleware in this example will be placed in `src/routes/team/layout.tsx`. As mentioned above you can make it a plugin middleware instead the code will be the same the file would just be placed in `src/routes/plugin@db.ts`.

References:

- [Qwik Middleware Docs](https://qwik.dev/docs/middleware/)
- [Qwik Plugin Docs](https://qwik.dev/docs/middleware/)

code: `src/routes/team/layout.tsx` optionally `src/routes/plugin@db.ts`

```typescript
// ./src/routes/team/layout.tsx

import { type RequestHandler } from "@builder.io/qwik-city";
import { drizzle } from "drizzle-orm/d1";
import { type AppDatabase, initializeDbIfNeeded } from "~/database";

export const onRequest: RequestHandler = async ({ platform }) => {
  const env = platform.env;
  await initializeDbIfNeeded(initD1(env));
};

function initD1(env: Env): () => Promise<AppDatabase> {
  return async () => drizzle(env.DB);
}
```

Now in your other files you can import the `getDB()` function from `database` directory and use it directly or make a const. This needs to be called inside of a function, or routeLoader, endpoint, routeAction, component etc... , it can't be called "outside" of this "scope". Ie:

```typescript
import { getDB } from "~/database";
// -- file scope -- wrong
const db = getDB(); // Wrong! this will not work

export const useRouteLoader = routeLoader$(() => {
  // -- functions scope -- correct
  const db = await getDB();
  db.select().from(posts).orderBy(desc(posts.created));
  return db;
  //
});
// this will work as well
export const useRouteLoader = routeLoader$(() => {
  // -- functions scope -- correct
  return await getDB().select().from(posts).orderBy(desc(posts.created));
  //
});
```

Now test locally.

```shell
npm run dev
```

If everything is running good, you can start making your preview and production migrations

```shell
npm run db:migrate:preview
```

```shell
npm run db:migrate:prod
```

And you can use Drizzle Studio for preview and production with

```shell
npm run db:studio:preview
```

```shell
npm run db:studio:prod
```

### Cloudflare Deployment through Github

git init
git add README.md
git commit -m "first commit"
git branch -M dev
git remote add origin <YOUR GITHUB REPO URL>.git
git push -u origin dev
