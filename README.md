# Material e621

> Material e621 is a modern, open source web client for e621.net. It is customizable, comes with a bunch of additional features that are not available on e621.net, and makes browsing posts a delightful experience.

## Screenshot Gallery

[![Material e621 - Landing Page](./screenshots/material-e621-screenshot-landing-page.png)](https://material-e621.vercel.app/)

[![Material e621 - Posts](./screenshots/material-e621-screenshot-posts-page.png)](https://material-e621.vercel.app/)

[![Material e621 - Details](./screenshots/material-e621-screenshot-post-details.png)](https://material-e621.vercel.app/)

[![Material e621 - Artist Dashboard](./screenshots/material-e621-screenshot-artist-dashboard-post-overview.png)](https://material-e621.vercel.app/)

[![Material e621 - Settings](./screenshots/material-e621-screenshot-settings-page.png)](https://material-e621.vercel.app/)

[![Material e621 - Recommendations](./screenshots/material-e621-screenshot-post-recommendations.png)](https://material-e621.vercel.app/)

[![Material e621 - Starred Tags](./screenshots/material-e621-screenshot-starred-tags.png)](https://material-e621.vercel.app/)

## Usage

### Hosted

Latest version is available on [Vercel](https://material-e621.vercel.app/).

### Docker

```bash
sudo docker run -d -p 8080:80 ghcr.io/avoonix/material-e621:latest
```

Alternatively, you can use `docker-compose up` with this [docker-compose.yml](./docker-compose.yml). Alternative docker compose setups and dockerfiles can be found in [#3](https://github.com/avoonix/material-e621/issues/3) and [#13](https://github.com/avoonix/material-e621/issues/13).

`latest` can be replaced with any of the [available versions](https://github.com/avoonix/material-e621/pkgs/container/material-e621/versions)

### Development

```bash
npm install
npm run dev
```

```bash
npx playwright test
npx playwright test --debug
npx playwright codegen
```
