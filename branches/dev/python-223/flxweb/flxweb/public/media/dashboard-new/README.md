# CK-12 Dashboard    

## Development

### Prerequisites
See **Production > Prerequisites**

### Setting up

#### Hot Reloading Initial Setup

Hot reloading scripts run by default at `localhost:8080`.

Update `flxweb/flxweb/templates/dashboard-new/index.html` to look like below:

```html
{% extends "dashboard-new/layout.html" %}
{% block title %}{{ _("Dashboard") }}{% endblock %}
{% block meta_extra %}
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
{% endblock %}


{% block stylesheets %}

<!-- <link rel="stylesheet" type="text/css" media="all" href="{{ h.asset_css('dashboard-new/dist/lib.css') }}" />
<link rel="stylesheet" type="text/css" media="all" href="{{ h.asset_css('dashboard-new/dist/globals.css') }}" />
<link rel="stylesheet" type="text/css" media="all" href="{{ h.asset_css('dashboard-new/dist/fonts.css') }}" />
<link rel="stylesheet" type="text/css" media="all" href="{{ h.asset_css('dashboard-new/dist/dashboard.css') }}" />

<link rel="stylesheet" type="text/css" media="all" href="{{ h.asset_css('dashboard-new/dist/ck12-master.min.css') }}" /> -->

{% endblock %}

{% block js %}
{{ super() }}
<script>
    require(['main'], function(){});
</script>

<!-- <script src="{{ h.asset_js('dashboard-new/dist/vendor.js') }}"></script>
<script src="{{ h.asset_js('dashboard-new/dist/dashboard.js') }}"></script> -->


<script src="https://localhost:8080/vendor.js"></script>
<script src="https://localhost:8080/lib.js"></script>
<script src="https://localhost:8080/globals.js"></script>
<script src="https://localhost:8080/fonts.js"></script>
<script src="https://localhost:8080/dashboard.js"></script>

<link rel="stylesheet" type="text/css" media="all" href="{{ h.asset_css('dashboard-new/css/ck12-master.css') }}" />
{% include 'common/global_js.html' %}

{% endblock %}

{% block content %}
{{ super() }}

<div id='dashboard'></div>
{% endblock %}
```

#### Starting Development Server

To start the development server run `npm run server`. The dashboard should now be in development mode, with hot reloading enabled.


## Production

### Prerequisites

Node version 4+ needs to be installed for ES6 related syntaxes in some of the build steps.

The server will need to have the sinopia registry added to the server, as some modules are CK-12 specific.

```sh
npm set registry http://frodo.ck12.org/sinopia
npm adduser --registry http://frodo.ck12.org/sinopia
```

### Building

You can then run `npm run build` to build out the bundles/assets.

## Webpack

### Scripts

Scripts are divided into two bundles -- `dashboard.js` and `vendor.js`. Third-party scripts are bundled into the vendor file as they will not be changing much.

The dashboard file is the main application script. It is minified on build.

#### Sourcemaps

The script sourcemaps are handled differently depending on the node environment (`NODE_ENV`). In development, we use [eval](https://webpack.github.io/docs/configuration.html#devtool) to speed up recompiling when changing the code. Production uses an external source mapping file.


### Stylesheets

We start with SCSS files and eventually convert them to [CSS Modules](https://github.com/css-modules/css-modules). The whole process looks like this:

1. Load in sass file (with sourcemaps in non-library code i.e. Foundation 6)
2. Resolve relative paths in url() statements
3. Run it through PostCSS (See postcss method for plugins used)
4. Run through CSS loader with module support
5. **DEVELOPMENT:** Use style loader to inject into the page. **PRODUCTION:** Extract CSS from JS files and set them as a CSS file

#### CSS files

- `dashboard.css` -- Main application styles
- `fonts.css` -- Font icons
- `globals.css` -- Overrides for portions of the site
- `lib.css` -- Foundation 6
- `ck12-master` -- Located in the `css` directory, it's version of the main site styles intended to work in the new dashboard only. The `@import url` in the sheet are eventually compiled and minified into a single stylesheet with the `npm run minify-css` script.

#### Important SCSS files

- `main.scss` -- Handles all mixins and scss variables used throughout the application. This should never import or contain actual styles. It uses the below files:
    * `_breakpoints.scss` -- Foundation breakpoints
    * `_mixins.scss` -- Mixins used sitewide
    * `_variables.scss` -- Global variables sitewide. Contains all UI colors.
    * `_utils.scss` -- Mostly Foundation 6 utility functions


- `foundation.lib.scss` -- The dashboard main Foundation 6 configuration file. Uses only the portions of Foundation 6 necessary for the dashboard app. Overrides are added into the stylesheet.
    * `_foundation.settings.scss` -- Original main foundation settings file
    * `_foundation-4-top-bar.scss` -- We use Foundation 4 top bar as Foundation 6 does not use the same classes as the sitewide nav bar
    * `_foundation.resets.scss` -- Browser resets


#### Sourcemaps

Sourcemaps are used the same in production and development as a separate map file. It is only used for `dashboard.css`.

### Fonts

Fonts are used in their own stylesheet located in the `fonts` directory. It is eventually built out into the `dist/fonts` directory in production.

### Images

Images loaded are run through `image-webpack` and optimized. They are then converted to a hashed version and put into the `dist` on production build.

## Design Decisions

### Templates

All HTML templates are located `flxweb/flxweb/templates/dashboard-new`.

#### Flex Grid
Flex grid utilizes CSS's flexbox system. It allows easier alignment and spacing, especially vertically, with less actual styling used.

#### Header and Footer

Since we're using the flex grid instead of Foundation's usual block grid, the sitewide header and footer was updated to use the new grid system.

Any changes to the common header/footer will also need to be reflected in the new dashboard header/footer.

#### CSS Modules

CSS modules were used to allow better modularization of the code. Since CSS cascades, having a hashed version of a CSS classname allows us to contain that class within a component.

