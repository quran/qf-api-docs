# Website

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

### Installation

This project requires **Node.js >=16.14**.

```
$ yarn
```

### Local Development

```
$ yarn gen-all
$ yarn start
```

Run `yarn gen-all` to generate the API documentation used by the site. The `yarn start` command then launches a local development server using the generated docs and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ yarn gen-all
$ yarn build
```

Run `yarn gen-all` before building to ensure the API documentation is up to date. The `yarn build` command then generates static content into the `build` directory which can be served using any static contents hosting service.

### Deployment

This site is deployed to **Cloudflare Pages** at [api-docs.quran.foundation](https://api-docs.quran.foundation).

#### Cloudflare Pages

Cloudflare Pages automatically builds and deploys the site when changes are pushed to the `main` branch:

- **Build Command**: `yarn clean-all && yarn build`
- **Build Output Directory**: `build`
- **Node Version**: 18 or 20

For detailed setup instructions, see [CLOUDFLARE_PAGES_SETUP.md](./CLOUDFLARE_PAGES_SETUP.md).

For migration planning and context, see [MIGRATION_CLOUDFLARE_PAGES.md](./MIGRATION_CLOUDFLARE_PAGES.md).

#### Branch Previews

Pull requests and non-production branches automatically receive preview deployments at:

```
https://<branch-name>.<project>.pages.dev
```

#### Manual Deployment (Legacy)

Using SSH:

```
$ USE_SSH=true yarn deploy
```

Not using SSH:

```
$ GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
