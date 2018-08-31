# js-isort

`js-isort` is a command line tool for grouping, sorting and deduping ES2015 imports.

The following transformations take place:

1. Groups imports by module specificity (e.g. built-in vs. external vs. internal)
2. Collapses imports defined on multiple lines into one line
3. Sorts imports alphabetically within groups (uses [natural sort order](https://en.wikipedia.org/wiki/Natural_sort_order))
4. Sorts import specifiers alphabetically (uses [natural sort order](https://en.wikipedia.org/wiki/Natural_sort_order))
5. Separates groups with an empty line

# Usage

```
  Usage: js-isort-cli [options] <file ...>

  Options:

    -v, --version             output the version number
    --webpack-config [value]  Path to webpack config with aliases
    -h, --help                output usage information
```

# Grouping

```
// 1. Side effects (NOT sorted alphabetically because order may matter)
import './global-styles.css';
import 'babel-polyfill';

// 2. Node.js builtin modules
import fs from 'fs';
import http from 'http';

// 3. External modules
import classNames from 'classnames';
import React from 'react';

// 4. Aliases (from Webpack)
import App from 'components/App';
import format from 'utils/format';

// 5. Relative parent modules (sorted by depth)
import middleware from '../../middleware';
import getUserId from '../getUserId';

// 6. Relative sibling modules
import queries from './queries';
import styles from './styles';

// 7. Imports from the index.js file
import main from './';
```

# Deduplication

If you have this:

```
import { Mutation } from 'react-apollo';
import { ApolloProvider } from 'react-apollo';
import ReactApollo from 'react-apollo';
```

You will get this:

```
import ReactApollo, { ApolloProvider, Mutation } from 'react-apollo';
```

# Specifiers

If you have this:

```
import foo1, { foo1000, foo200, foo30, foo4, bar } from 'foo';
```

You will get this:

```
import foo1, { bar, foo4, foo30, foo200, foo1000 } from 'foo';
```

# Aliases

In order for aliases to be recognized, you must pass in the path to your Webpack config file:

```
js-isort-cli --webpack-config webpack.config.js myFile.js
```

Note: it can be expensive to import the Webpack config, so `js-isort` will cache the aliases in a temporary file. The cache is invalidated when the webpack config file is updated.

# Comments

Comments at the top of the file will stay in place. All other comments will move with the associated import.

# JS Syntax SUpport

`js-isort` uses Babel under the hood, with a couple Stage 3 language features and support for JSX enabled.

# Configuration

`js-isort` is not currently configurable. Maybe one day.

# License

See [LICENSE](LICENSE).
