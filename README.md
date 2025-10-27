# _Leipzig Haushaltsdaten - Dataviz_

![Data visualization of Leipzig's expenditures](/public/images/readme.png)

This data visualization communicates Leipzig's public expenditures. It visualizes budget data across different policy areas and products to provide transparency into how public funds are allocated.

The means of visualization is a so-called [treemap](https://en.wikipedia.org/wiki/Treemapping) which allows comparing different expense areas and exploring the hierarchies of budget allocations.

The treemap visualization is embeddable using the _Einbetten_ option.

In addition, a list below the visualization renders the budget items which belong to the currently selected policy area (ordered by amount in €).

A homepage and FAQ page provide contextual information.

> **Attention: This is a prototype, not finished software.**

## The data

The data used comes from the Leipzig city budget (Ergebnishaushalt). The data is provided as Excel files (`.xlsx`) with a "Grunddaten" sheet containing all budget items.

The data is processed using a pure JavaScript/Node.js pipeline:
1. **Processing**: Excel file → Intermediate JSON (`scripts/process-leipzig-data.js`)
2. **Generation**: JSON → Static files for web serving (`scripts/generate-static-json.js`)

All budget data is served as **static JSON files** from the `public/data/` directory - no database required. This approach provides:
- Zero configuration (no credentials needed)
- Maximum performance (CDN-served, edge-cached)
- Complete reproducibility (Git commit = exact dataset)
- Full audit trail (all changes tracked in Git)

## Tech stack

This website is a NextJS app configured with:

- [Typescript](https://www.typescriptlang.org/)
- Linting with [ESLint](https://eslint.org/)
- Formatting with [Prettier](https://prettier.io/)
- Linting, typechecking and formatting on by default using [`husky`](https://github.com/typicode/husky) for commit hooks
- Testing with [Jest](https://jestjs.io/) and [`react-testing-library`](https://testing-library.com/docs/react-testing-library/intro)

## Project structure

Basic Next.js app

### Pages

- `pages/index.tsx` is the homepage.
- `pages/visualisierung.tsx` is the main route for the visualization. It renders the most important components for the visualization.
- `pages/share.tsx` is almost identical to `pages/visualisierung.tsx`. It is used for sharing an SVG-only version of the currently rendered treemap.
- `pages/faq.tsx` provides some questions and answers.

### Components

The most important component is probably the treemap component which can be found in `src/components/TreeMap/index.tsx`. The component expects hierarchical data (`hierarchy` prop) to be passed to it (as specified in its type declaration). It then utilizes [D3](https://d3js.org/) to render a treemap SVG which can be zoomed into and out.

The treemap can be controlled with the filters defined in `src/components/TreeMapControls/index.tsx`.

### Texts

The texts are currently hard-coded into the pages/components. In the future a more beginner-friendly structure could be applied (such as extracting all text content into a single content provider file).

## Getting started

### Requirements

#### Node.js

This project is a Next.js app which requires you to have [Node.js](https://nodejs.org/en/) installed.

That's it! No database setup, no credentials needed.

### Installation

Clone the repository to your local machine:

```bash
git clone git@github.com:berlin/haushaltsdaten.git
```

Move into the repository folder:

```bash
cd haushaltsdaten
```

Make sure you use the Node.js version specified in `.nvmrc`. Find out which Node version you're currently on with:

```bash
node --version
```

If this version differs from the one specified in `.nvmrc`, please install the required version, either manually, or using a tool such as [nvm](https://github.com/nvm-sh/nvm), which allows switching to the correct version via:

```bash
nvm use
```

With the correct Node version, install the dependencies:

```bash
npm install
```

You are now ready to start a local development server on http://localhost:3000 via:

```bash
npm run dev
```

That's it! The application will serve pre-generated static JSON files from `public/data/`.

## Data Processing

When new Leipzig budget data becomes available, process it with these commands:

```bash
# Place the Excel file in the daten/ directory
cp path/to/leipzig-ergebnishaushalt-2025_2026.xlsx daten/

# Process and generate static JSON files
npm run data:build

# Start development server
npm run dev
```

Available data commands:
- `npm run data:process` - Process Excel → intermediate JSON
- `npm run data:generate` - Generate static JSON files for serving
- `npm run data:build` - Run both commands in sequence

## Workflow

New features, fixes, etc. should always be developed on a separate branch:

- In your local repository, checkout the `main` branch.
- Run `git checkout -b <name-of-your-branch>` to create a new branch (ideally following [Conventional Commits guidelines](https://www.conventionalcommits.org)).
- Make your changes
- Push your changes to the remote: `git push -U origin HEAD`
- Open a pull request.

You can commit using the `npm run cm` command to ensure your commits follow our conventions.

## Deployment

_Leipzig Haushaltsdaten - Dataviz_ is deployed to the cloud with [Vercel](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=next-example) ([Documentation](https://nextjs.org/docs/deployment)).

The static JSON files in `public/data/` are automatically served via Vercel's CDN for optimal performance.

## Page analytics

We use [Matomo](https://matomo.org/) for website analytics. Matomo is respectful of the users' privacy, the page visits are tracked anonymously.

In the production environment, a `NEXT_PUBLIC_MATOMO_URL` and `NEXT_PUBLIC_MATOMO_SITE_ID` is configured for this purpose.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center"><a href="https://github.com/Lisa-Stubert"><img src="https://avatars.githubusercontent.com/u/61182572?v=4?s=64" width="64px;" alt="Lisa Stubert"/><br /><sub><b>Lisa Stubert</b></sub></a><br /><a href="#projectManagement-Lisa-Stubert" title="Project Management">📆</a> <a href="#ideas-Lisa-Stubert" title="Ideas, Planning, & Feedback">🤔</a> <a href="#mentoring-Lisa-Stubert" title="Mentoring">🧑‍🏫</a> <a href="#eventOrganizing-Lisa-Stubert" title="Event Organizing">📋</a> <a href="#data-Lisa-Stubert" title="Data">🔣</a></td>
      <td align="center"><a href="https://github.com/m-b-e"><img src="https://avatars.githubusercontent.com/u/36029603?v=4?s=64" width="64px;" alt="Max B. Eckert"/><br /><sub><b>Max B. Eckert</b></sub></a><br /><a href="#ideas-m-b-e" title="Ideas, Planning, & Feedback">🤔</a> <a href="#eventOrganizing-m-b-e" title="Event Organizing">📋</a></td>
      <td align="center"><a href="https://github.com/dnsos"><img src="https://avatars.githubusercontent.com/u/15640196?v=4?s=64" width="64px;" alt="Dennis Ostendorf"/><br /><sub><b>Dennis Ostendorf</b></sub></a><br /><a href="#design-dnsos" title="Design">🎨</a> <a href="https://github.com/berlin/haushaltsdaten/commits?author=dnsos" title="Code">💻</a> <a href="https://github.com/berlin/haushaltsdaten/commits?author=dnsos" title="Documentation">📖</a></td>
      <td align="center"><a href="https://vogelino.com/"><img src="https://avatars.githubusercontent.com/u/2759340?v=4?s=64" width="64px;" alt="Lucas Vogel"/><br /><sub><b>Lucas Vogel</b></sub></a><br /><a href="#design-vogelino" title="Design">🎨</a> <a href="https://github.com/berlin/haushaltsdaten/commits?author=vogelino" title="Code">💻</a> <a href="https://github.com/berlin/haushaltsdaten/commits?author=vogelino" title="Documentation">📖</a></td>
      <td align="center"><a href="https://fabianmoronzirfas.me/"><img src="https://avatars.githubusercontent.com/u/315106?v=4?s=64" width="64px;" alt="Fabian Morón Zirfas"/><br /><sub><b>Fabian Morón Zirfas</b></sub></a><br /><a href="https://github.com/berlin/haushaltsdaten/commits?author=ff6347" title="Code">💻</a> <a href="https://github.com/berlin/haushaltsdaten/commits?author=ff6347" title="Documentation">📖</a></td>
      <td align="center"><a href="https://github.com/szaimen"><img src="https://avatars.githubusercontent.com/u/42591237?v=4?s=64" width="64px;" alt="Simon L."/><br /><sub><b>Simon L.</b></sub></a><br /><a href="#ideas-szaimen" title="Ideas, Planning, & Feedback">🤔</a> <a href="#design-szaimen" title="Design">🎨</a> <a href="https://github.com/berlin/haushaltsdaten/commits?author=szaimen" title="Code">💻</a></td>
      <td align="center"><a href="https://github.com/flonix8"><img src="https://avatars.githubusercontent.com/u/19605089?v=4?s=64" width="64px;" alt="Florian Stanek"/><br /><sub><b>Florian Stanek</b></sub></a><br /><a href="#ideas-flonix8" title="Ideas, Planning, & Feedback">🤔</a> <a href="#design-flonix8" title="Design">🎨</a> <a href="https://github.com/berlin/haushaltsdaten/commits?author=flonix8" title="Code">💻</a></td>
      <td align="center"><a href="https://github.com/julizet"><img src="https://avatars.githubusercontent.com/u/52455010?v=4?s=64" width="64px;" alt="Julia Zet"/><br /><sub><b>Julia Zet</b></sub></a><br /><a href="#ideas-julizet" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/berlin/haushaltsdaten/commits?author=julizet" title="Code">💻</a> <a href="#design-julizet" title="Design">🎨</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!


## Content Licencing

Texts and content available as [CC BY](https://creativecommons.org/licenses/by/3.0/de/). 

## Credits

<table>
  <tr>
    <td>
      <a src="https://odis-berlin.de">
        <br />
        <br />
        <img width="200" src="https://logos.citylab-berlin.org/logo-odis-berlin.svg" />
      </a>
    </td>
    <td>
      Together with: <a src="https://citylab-berlin.org/en/start/">
        <br />
        <br />
        <img width="200" src="https://logos.citylab-berlin.org/logo-citylab-berlin.svg" />
      </a>
    </td>
    <td>
      A project by: <a src="https://www.technologiestiftung-berlin.de/en/">
        <br />
        <br />
        <img width="150" src="https://logos.citylab-berlin.org/logo-technologiestiftung-berlin-en.svg" />
      </a>
    </td>
    <td>
      Supported by: <a src="https://www.berlin.de/rbmskzl/en/">
        <br />
        <br />
        <img width="80" src="https://logos.citylab-berlin.org/logo-berlin-senweb-en.svg" />
      </a>
    </td>
  </tr>
</table>

## Special thanks

This project is inspired by the website [offenerhaushalt.de](https://offenerhaushalt.de) of the [Open Knowledge Foundation](https://okfn.de). This was a website that made budget data for cities and municipalities for Germany viewable in a centralized and standardized way. Since 2021, however, *Offener Haushalt* can no longer be actively maintained. The reason for this is that in the current funding situation, it is difficult to operate platforms that are oriented towards the common good on a permanent basis, and strategies for adoption on the part of the administration are unfortunately lacking.

This Leipzig implementation builds on the original Berlin prototype, adapting it to use static JSON files instead of a database, making it simpler to deploy and maintain for other cities.

