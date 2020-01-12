/* eslint-disable max-len */
const isort = require(`../src/js-isort`);

// =============================================================================
//  Empty States
// =============================================================================

it(`does not change for empty file`, () => {
  const content = ``;

  expect(isort(content)).toEqual(content);
});

it(`does not change when there are only empty lines`, () => {
  const content = `



  `;

  expect(isort(content)).toEqual(content);
});

it(`does not change when there are no imports`, () => {
  const content = `
console.log('foo');
  `.trim();

  expect(isort(content)).toEqual(content);
});

it(`does not change when there are no imports and empty lines`, () => {
  const content = `

console.log('foo');

  `;

  expect(isort(content)).toEqual(content);
});

it(`does not change when there are no imports and comments`, () => {
  const content = `
/**
 * This is a description of the file.
 */
console.log('foo');
  `.trim();

  expect(isort(content)).toEqual(content);
});

// =============================================================================
//  Basic ordering
// =============================================================================

it(`works on a single import`, () => {
  const content = `
import a from 'foo';

console.log('foo');
  `.trim();

  expect(isort(content)).toEqual(content);
});

it(`works on ordered imports`, () => {
  const content = `
import b from 'bar';
import a from 'foo';

console.log('foo');
  `.trim();

  expect(isort(content)).toEqual(content);
});

it(`works on out-of-order imports`, () => {
  const content = `
import a from 'foo';
import b from 'bar';

console.log('foo');
  `.trim();

  const result = `
import b from 'bar';
import a from 'foo';

console.log('foo');
  `.trim();

  expect(isort(content)).toEqual(result);
});

it(`removes empty space at the bottom of the file`, () => {
  const content = `

import a from 'foo';
import b from 'bar';

`;

  const result = `
import b from 'bar';
import a from 'foo';

`.trim();

  expect(isort(content)).toEqual(result);
});

// =============================================================================
//  Import variations
// =============================================================================

it(`works on all import styles`, () => {
  const content = `
import test1 from "zar";
import * as test2 from "yar";
import { test3 } from "xar";
import { test4 as alias } from "qar";
import { test5, test6 } from "par";
import { test7, test8 as alias2 } from "dar";
import test9, { test10, test11, test12 } from "car";
import test13, * as test15 from "bar";
import "aar";

console.log('foo');
  `.trim();

  const result = `
import "aar";
import test13, * as test15 from "bar";
import test9, { test10, test11, test12 } from "car";
import { test7, test8 as alias2 } from "dar";
import { test5, test6 } from "par";
import { test4 as alias } from "qar";
import { test3 } from "xar";
import * as test2 from "yar";
import test1 from "zar";

console.log('foo');
  `.trim();

  expect(isort(content)).toEqual(result);
});

it(`works on all import styles with single quotes`, () => {
  const content = `
import test1 from 'zar';
import * as test2 from 'yar';
import { test3 } from 'xar';
import { test4 as alias } from 'qar';
import { test5, test6 } from 'par';
import { test7, test8 as alias2 } from 'dar';
import test9, { test10, test11, test12 } from 'car';
import test13, * as test15 from 'bar';
import 'aar';

console.log('foo');
  `.trim();

  const result = `
import 'aar';

import test13, * as test15 from 'bar';
import test9, { test10, test11, test12 } from 'car';
import { test7, test8 as alias2 } from 'dar';
import { test5, test6 } from 'par';
import { test4 as alias } from 'qar';
import { test3 } from 'xar';
import * as test2 from 'yar';
import test1 from 'zar';

console.log('foo');
  `.trim();

  expect(isort(content)).toEqual(result);
});

it(`works on multi-line imports`, () => {
  const content = `
import {
  export1,
  export2,
  export3,
  export4,
  export5,
} from 'foo';
import { export7 } from 'bar';
import {
  export1,
  export2,
  export3,
} from 'baz';

console.log('foo');
  `.trim();

  const result = `
import { export7 } from 'bar';
import { export1, export2, export3 } from 'baz';
import { export1, export2, export3, export4, export5 } from 'foo';

console.log('foo');
  `.trim();

  expect(isort(content)).toEqual(result);
});

it(`does nothing with really long lines`, () => {
  const content = `
import { foo1, foo2, foo3, foo4, foo5, foo6, foo7, foo8, foo9, foo10, foo11 } from "foo";
  `.trim();

  const result = `
import { foo1, foo2, foo3, foo4, foo5, foo6, foo7, foo8, foo9, foo10, foo11 } from "foo";
  `.trim();

  expect(isort(content)).toEqual(result);
});

it(`does natural alphanumeric sorting`, () => {
  const content = `
import { foo1000, foo200, foo30, foo4 } from "foo";
  `.trim();

  const result = `
import { foo4, foo30, foo200, foo1000 } from "foo";
  `.trim();

  expect(isort(content)).toEqual(result);
});

// =============================================================================
//  Comments
// =============================================================================

it(`does nothing when there are only comments`, () => {
  const content = `
// This comment should be ignored
/**
 * This comment should also be ignored
 */
/**
 * This comment has multiple lines and...

 * You guessed it, it should be ignored.
 */
// One more for good measure
  `.trim();

  expect(isort(content)).toEqual(content);
});

it(`keeps the comment pinned to the import`, () => {
  const content = `
import c from 'car';
// This is above 'foo'
import a from 'foo';
// This is above 'bar'
import b from 'bar';

console.log('foo');
  `.trim();

  const result = `
// This is above 'bar'
import b from 'bar';
import c from 'car';
// This is above 'foo'
import a from 'foo';

console.log('foo');
  `.trim();

  expect(isort(content)).toEqual(result);
});

it(`keeps trailing comments pinned to the import`, () => {
  const content = `
import c from 'car'; // This is next to 'car'
import a from 'foo'; // This is next to 'foo'
import b from 'bar'; // This is next to 'bar'

console.log('foo');
  `.trim();

  const result = `
import b from 'bar'; // This is next to 'bar'
import c from 'car'; // This is next to 'car'
import a from 'foo'; // This is next to 'foo'

console.log('foo');
  `.trim();

  expect(isort(content)).toEqual(result);
});

it(`does not move comments at the top of the file`, () => {
  const content = `
/**
 * This is a description of the module
 */
// @flow
/* eslint-disable */
import c from 'car';
// This is above 'foo'
import a from 'foo';
// This is above 'bar'
import b from 'bar';

console.log('foo');
  `.trim();

  const result = `
/**
 * This is a description of the module
 */
// @flow
/* eslint-disable */
// This is above 'bar'
import b from 'bar';
import c from 'car';
// This is above 'foo'
import a from 'foo';

console.log('foo');
  `.trim();

  expect(isort(content)).toEqual(result);
});

it(`ignores comments directly below all the imports`, () => {
  const content = `
import c from 'car';
import a from 'foo';
import b from 'bar';

// This comment should be ignored
/**
 * This comment should also be ignored
 */

console.log('foo');
  `.trim();

  const result = `
import b from 'bar';
import c from 'car';
import a from 'foo';

// This comment should be ignored
/**
 * This comment should also be ignored
 */

console.log('foo');
  `.trim();

  expect(isort(content)).toEqual(result);
});

it(`keeps single-line block comments pinned to the import`, () => {
  const content = `
import c from 'car';
/* This is above 'foo' */
import a from 'foo';
/* This is above 'bar' */
import b from 'bar';

console.log('foo');
  `.trim();

  const result = `
/* This is above 'bar' */
import b from 'bar';
import c from 'car';
/* This is above 'foo' */
import a from 'foo';

console.log('foo');
  `.trim();

  expect(isort(content)).toEqual(result);
});

it(`keeps multi-line block comments pinned to the import`, () => {
  const content = `
import c from 'car';
/**
 * This is above 'foo'
 */
import a from 'foo';
/**
 * This is above 'bar'
 */
import b from 'bar';

console.log('foo');
  `.trim();

  const result = `
/**
 * This is above 'bar'
 */
import b from 'bar';
import c from 'car';
/**
 * This is above 'foo'
 */
import a from 'foo';

console.log('foo');
  `.trim();

  expect(isort(content)).toEqual(result);
});

it(`keeps multiple comments pinned to the import`, () => {
  const content = `
import c from 'car';
// This is above 'foo'
// This is also above 'foo'
// This is also also above 'foo'
import a from 'foo';
// This is above 'bar'
// This is also above 'bar'
// This is also also above 'bar'
import b from 'bar';

console.log('foo');
  `.trim();

  const result = `
// This is above 'bar'
// This is also above 'bar'
// This is also also above 'bar'
import b from 'bar';
import c from 'car';
// This is above 'foo'
// This is also above 'foo'
// This is also also above 'foo'
import a from 'foo';

console.log('foo');
  `.trim();

  expect(isort(content)).toEqual(result);
});

it(`keeps mixed comments pinned to the import`, () => {
  const content = `
import c from 'car';
// This is above 'foo'
/* This is also above 'foo' */
/**
 * This is also also above 'foo'
 */
import a from 'foo';
/**
 * This is also also above 'bar'
 */
/* This is also above 'bar' */
// This is above 'bar'
import b from 'bar';

console.log('foo');
  `.trim();

  const result = `
/**
 * This is also also above 'bar'
 */
/* This is also above 'bar' */
// This is above 'bar'
import b from 'bar';
import c from 'car';
// This is above 'foo'
/* This is also above 'foo' */
/**
 * This is also also above 'foo'
 */
import a from 'foo';

console.log('foo');
  `.trim();

  expect(isort(content)).toEqual(result);
});

it(`gets weird when an import has multiple trailing comments`, () => {
  const content = `
import {
  foo1, // this is comment for foo1
  foo2, // this is comment for foo2
  foo3, // this is comment for foo3
} from 'foo';
  `.trim();

  const result = `
import { foo1 // this is comment for foo1
, foo2 // this is comment for foo2
, foo3 // this is comment for foo3
} from 'foo';
  `.trim();

  expect(isort(content)).toEqual(result);
});

// =============================================================================
//  Grouping
// =============================================================================

it(`regroups imports based on specificity`, () => {
  const aliases = [`utils`];

  const content = `
import 'prevent-comment-from-pinning-to-top';
// 7: index.js in the same directory
import indexFunc from './';
// 6: Sibling modules
import siblingFunc from './siblingModule';
// 5: Modules from parent directory
import parentFunc from '../parentModule';
// 4: Aliases
import utilFunc from 'utils/utilModule';
// 3: External modules
import webpack from 'webpack';
// 2: Node builtin modules
import fs from 'fs';
// 1: Import with side effects
import 'babel-polyfill';
  `.trim();

  const result = `
import 'prevent-comment-from-pinning-to-top';
// 1: Import with side effects
import 'babel-polyfill';

// 2: Node builtin modules
import fs from 'fs';

// 3: External modules
import webpack from 'webpack';

// 4: Aliases
import utilFunc from 'utils/utilModule';

// 5: Modules from parent directory
import parentFunc from '../parentModule';

// 6: Sibling modules
import siblingFunc from './siblingModule';

// 7: index.js in the same directory
import indexFunc from './';
  `.trim();

  expect(isort(content, aliases)).toEqual(result);
});

it(`sorts within import groups`, () => {
  const aliases = [`components`, `utils`];

  const content = `
import indexFunc from './';
import siblingFunc1 from './siblingModule1';
import parentFunc1 from '../parentModule1';
import Component from 'components/Component';
import React from 'react';
import http from 'http';
import utilFunc2 from 'utils/utilModule2';
import siblingFunc2 from './siblingModule2';
import parentFunc2 from '../parentModule2';
import webpack from 'webpack';
import 'styles';
import fs from 'fs';
import utilFunc1 from 'utils/utilModule1';
import 'babel-polyfill';
  `.trim();

  const result = `
import 'styles';
import 'babel-polyfill';

import fs from 'fs';
import http from 'http';

import React from 'react';
import webpack from 'webpack';

import Component from 'components/Component';
import utilFunc1 from 'utils/utilModule1';
import utilFunc2 from 'utils/utilModule2';

import parentFunc1 from '../parentModule1';
import parentFunc2 from '../parentModule2';

import siblingFunc1 from './siblingModule1';
import siblingFunc2 from './siblingModule2';

import indexFunc from './';
  `.trim();

  expect(isort(content, aliases)).toEqual(result);
});

it(`sorts imports within modules`, () => {
  const content = `
import { kkk, jjj, iii, hhh, ggg, fff, eee, ddd, ccc, bbb, aaa } from "h";
import {
  s,
  r,
  q,
} from 'g';
import {
p,
  o ,

n,
} from "f";
import { m,
  l, k    ,
} from 'e'    ;
import { j,
  i, h} from 'd';
import { g,f} from "c";
import {e        , d} from 'b';
import { c, b, a } from 'a';
  `.trim();

  const result = `
import { a, b, c } from 'a';
import { d, e } from 'b';
import { f, g } from "c";
import { h, i, j } from 'd';
import { k, l, m } from 'e';
import { n, o, p } from "f";
import { q, r, s } from 'g';
import { aaa, bbb, ccc, ddd, eee, fff, ggg, hhh, iii, jjj, kkk } from "h";
`.trim();

  expect(isort(content)).toEqual(result);
});

it(`works on aliases of different import styles`, () => {
  const aliases = [`actions`, `components`, `styles`];

  const content = `
import Button from 'components/Button';
import actions from 'actions';
import 'styles';
  `.trim();

  const result = `
import 'styles';

import actions from 'actions';
import Button from 'components/Button';
  `.trim();

  expect(isort(content, aliases)).toEqual(result);
});

it(`does not match alias if other module starts with same name`, () => {
  const aliases = [`components`, `styles`];

  const content = `
import Button from 'components/Button';
import styles from 'styles';
import stylesParser from 'styles-parser';
  `.trim();

  const result = `
import stylesParser from 'styles-parser';

import Button from 'components/Button';
import styles from 'styles';
  `.trim();

  expect(isort(content, aliases)).toEqual(result);
});

it(`does not add a newline after last group if it doesn't need to`, () => {
  const content = `
import React from 'react';
import http from 'http';
import webpack from 'webpack';

console.log('foo');
  `.trim();

  const result = `
import http from 'http';

import React from 'react';
import webpack from 'webpack';

console.log('foo');
`.trim();

  expect(isort(content)).toEqual(result);
});

it(`adds a newline after last group if it needs to`, () => {
  const content = `
import React from 'react';
import http from 'http';
import webpack from 'webpack';
console.log('foo');
  `.trim();

  const result = `
import http from 'http';

import React from 'react';
import webpack from 'webpack';

console.log('foo');
`.trim();

  expect(isort(content)).toEqual(result);
});

it(`groups specifiers when modules are duplicated`, () => {
  const content = `
import { Mutation } from 'react-apollo';
import { ApolloProvider } from 'react-apollo';
import ReactApollo from 'react-apollo';
import ReactApollo2, { ApolloProvider2, Mutation2 } from 'react-apollo2';
  `.trim();

  const result = `
import ReactApollo, { ApolloProvider, Mutation } from 'react-apollo';
import ReactApollo2, { ApolloProvider2, Mutation2 } from 'react-apollo2';
`.trim();

  expect(isort(content)).toEqual(result);
});

it(`combines comments when collapsing imports`, () => {
  const content = `
import { Mutation } from 'react-apollo'; // { Mutation }
// { ApolloProvider }
import { ApolloProvider } from 'react-apollo';
/**
 *ReactApollo
 */
import ReactApollo from 'react-apollo';
  `.trim();

  const result = `
// { ApolloProvider }
/**
 *ReactApollo
 */
import ReactApollo, { ApolloProvider, Mutation } from 'react-apollo'; // { Mutation }
`.trim();

  expect(isort(content)).toEqual(result);
});

it(`handles duplicated non-default imports`, () => {
  const content = `
import ReactApollo, { Mutation } from 'react-apollo';
import { Mutation } from 'react-apollo';
  `.trim();

  const result = `
import ReactApollo, { Mutation } from 'react-apollo';
`.trim();

  expect(isort(content)).toEqual(result);
});

it(`handles duplicated default imports with the same name`, () => {
  const content = `
import ReactApollo, { Mutation } from 'react-apollo';
import ReactApollo from 'react-apollo';
  `.trim();

  const result = `
import ReactApollo, { Mutation } from 'react-apollo';
`.trim();

  expect(isort(content)).toEqual(result);
});

it(`handles duplicated default imports with different names`, () => {
  const content = `
import ReactApollo, { Mutation } from 'react-apollo';
import Apollo from 'react-apollo';
  `.trim();

  const result = `
import Apollo, ReactApollo, { Mutation } from 'react-apollo';
`.trim();

  expect(isort(content)).toEqual(result);
});

// =============================================================================
//  Errors
// =============================================================================

it(`throws an error if there is an unclosed comment`, () => {
  const content = `
/* I forgot to close this comment
import a from 'foo';
import b from 'baz';

console.log('foo');
  `.trim();

  expect(() => {
    return isort(content);
  }).toThrow();
});

it(`throws an error if the import is closed twice`, () => {
  const content = `
import {
  a3,
  a2,
  a1,
} from 'foo';
} from 'foo';
import b from 'baz';

console.log('foo');
  `.trim();

  expect(() => {
    return isort(content);
  }).toThrow();
});

it(`ignores imports that aren't at the top of the file`, () => {
  const content = `
import a from 'foo';
import c from 'baz';

console.log('foo');

import b from 'bar';
  `.trim();

  const result = `
import c from 'baz';
import a from 'foo';

console.log('foo');

import b from 'bar';
  `.trim();

  expect(isort(content)).toEqual(result);
});

// =============================================================================
//  Non-standard JS syntax
// =============================================================================

it(`works on JSX`, () => {
  const content = `
import a from 'foo';
import c from 'baz';

const jsxElem = (
  <h1>Hi</h1>
);
  `.trim();

  const result = `
import c from 'baz';
import a from 'foo';

const jsxElem = (
  <h1>Hi</h1>
);
  `.trim();

  expect(isort(content)).toEqual(result);
});

it(`works on class properties`, () => {
  const content = `
import a from 'foo';
import c from 'baz';

class Test {

  state = {
    testState: false,
  };

}
  `.trim();

  const result = `
import c from 'baz';
import a from 'foo';

class Test {

  state = {
    testState: false,
  };

}
  `.trim();

  expect(isort(content)).toEqual(result);
});

it(`works on object rest spread`, () => {
  const content = `
import a from 'foo';
import c from 'baz';

const d1 = {a: 1, b:2};

const d2 = {
  ...d1,
  c: 1,
  d: 2,
};
  `.trim();

  const result = `
import c from 'baz';
import a from 'foo';

const d1 = {a: 1, b:2};

const d2 = {
  ...d1,
  c: 1,
  d: 2,
};
  `.trim();

  expect(isort(content)).toEqual(result);
});

// =============================================================================
//  Test a very complicated example
// =============================================================================

it(`works on a very complicated example`, () => {
  const aliases = [`components`, `utils`];

  const content = `
// Test comment test comment test comment test comment
/*
Test comment test comment tes

 comment test comment
 *//*********************************************************
      * Test comment test comment test comment test comment
  ***********************************************************/
/***Test comment test comment test comment test comment*/
import {
withStyles } from '@material-ui/core/styles';
import LoginForm3 from '../../LoginForm'

;
import
PropTypes from 'prop-types'
;;;
import React from 'react'     ;
// Test comment test comment test comment test comment //
import {
Mutation } from 'react-apollo';
      import {    withRouter      } from 'react-router';
import   CssBaseline   from   "@material-ui/core/CssBaseline"  ;

////////////////////
             import LoginForm2 from '../LoginForm';
import

{

MuiThemeProvider

}

from

'@material-ui/core/styles'

;

     /**
 * Test comment test comment test comment test comment
          */
//
      import
      {
  InMemoryCache } from "apollo-cache-inmemory"; // awer awer

import{ApolloClient}from'apollo-client';import { HttpLink } from
'apollo-link-http';
import { ApolloProvider } from 'react-apollo';
        /*

     Test comment test comment test comment test     comment


  */
import
ReactDOM from
'react-dom'; import {
Route, BrowserRouter,
Switch } from 'react-router-dom'; /* load only weights required by
// Material UI: 300, 400 and 500 */
import 'typeface-roboto';

import mutations from './mutations';
   // Test comment test comment test comment test comment
import './utils';

//import App from 'components/App';
import AuthenticatedRoute from 'components/AuthenticatedRoute';
   //    import ErrorBoundary from  'components/ErrorBoundary' ;
import Login from 'components/Login';
// Test comment test comment     test comment test comment
import { loggingMiddleware, // testing
authMiddleware } from 'utils/auth';

import LoginPage from './LoginPage';




import {
  itest8,
  itest9,
  itest10,
  itest11,
  itest12,
  itest1,
  itest2,
  itest3,
  itest4,
  itest5,
  itest6,
  itest7,
} from 'utils/itest';
// Test comment test comment test comment test comment  //////
/////// Test comment test comment test comment test comment
import registerServiceWorker from 'utils/registerServiceWorker';
import theme from 'utils/styles/theme';
import { setUserToken as tokenUserSet } from 'utils/auth';

import LoginForm from './LoginForm';
import { ddd, ccc, /*
        \\/* *\\/
        */bbb, aaa, zzzz, yyy, xxx, www, vvv, uuu, ttt } from "h";
import {
  s,
  r,
  q,
} from 'p';/**
 * Test comment test comment

test comment test comment
 */import {
o,
  n ,

m,
} from "f";     /*thisisfs*/import fs from 'fs';    import http from 'http';

   import  main from   './'             ;

import 'babel-polyfills';
import 'querystring';//this is qyuerystring
import { l as jjjjjjj,
  k as lllll, j  as  kkkkkk ,
} from 'e'    ;
import { z,
  i, h} from 'd';
import { g,f} from "c";
import {e        , d} from 'b';
import { c as abc, b, a } from 'a';


import styles from './styles'; console.log('import "foo";');

// More testing of comments (this time at the bottom)

console.log('import "bar";');

import 'one-more-thing';

const makeSureJSXDoesntBreak = (
  <div>
    Hello
  </div>
);

  `.trim();

  const result = `
// Test comment test comment test comment test comment
/*
Test comment test comment tes

 comment test comment
 *//*********************************************************
      * Test comment test comment test comment test comment
  ***********************************************************/
/***Test comment test comment test comment test comment*/
/* load only weights required by
// Material UI: 300, 400 and 500 */
import 'typeface-roboto';
// Test comment test comment test comment test comment
import './utils';
import 'babel-polyfills';
import 'querystring';
 //this is qyuerystring
import fs from 'fs';
import http from 'http';

import CssBaseline from "@material-ui/core/CssBaseline";
import { MuiThemeProvider, withStyles } from '@material-ui/core/styles';
import { a, b, c as abc } from 'a';
/**
* Test comment test comment test comment test comment
     */
//
import { InMemoryCache } from "apollo-cache-inmemory"; // awer awer
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { d, e } from 'b';
import { f, g } from "c";
import { h, i, z } from 'd';
import { j as kkkkkk, k as lllll, l as jjjjjjj } from 'e';
import { m, n, o } from "f";
/*thisisfs*/
import { aaa, bbb, ccc
/*
\\/* *\\/
*/
, ddd, ttt, uuu, vvv, www, xxx, yyy, zzzz } from "h";
import { q, r, s } from 'p';
import PropTypes from 'prop-types';
import React from 'react';
// Test comment test comment test comment test comment //
import { ApolloProvider, Mutation } from 'react-apollo';
/*
Test comment test comment test comment test     comment
*/
import ReactDOM from 'react-dom';
import { withRouter } from 'react-router';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

//import App from 'components/App';
import AuthenticatedRoute from 'components/AuthenticatedRoute';
//    import ErrorBoundary from  'components/ErrorBoundary' ;
import Login from 'components/Login';
// Test comment test comment     test comment test comment
import { authMiddleware, loggingMiddleware // testing
, setUserToken as tokenUserSet } from 'utils/auth';
import { itest1, itest2, itest3, itest4, itest5, itest6, itest7, itest8, itest9, itest10, itest11, itest12 } from 'utils/itest';
// Test comment test comment test comment test comment  //////
/////// Test comment test comment test comment test comment
import registerServiceWorker from 'utils/registerServiceWorker';
import theme from 'utils/styles/theme';

import LoginForm3 from '../../LoginForm';
////////////////////
import LoginForm2 from '../LoginForm';

import LoginForm from './LoginForm';
import LoginPage from './LoginPage';
import mutations from './mutations';
import styles from './styles';

import main from './';

console.log('import "foo";');

// More testing of comments (this time at the bottom)

console.log('import "bar";');

import 'one-more-thing';

const makeSureJSXDoesntBreak = (
  <div>
    Hello
  </div>
);
  `.trim();

  expect(isort(content, aliases)).toEqual(result);
});
