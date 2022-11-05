/**
 * Group and sort JS imports.
 *
 * Imports are grouped based on the module type and sorted based on the name.
 */
const babelParser = require(`@babel/parser`);
const generate = require(`@babel/generator`);
const os = require(`os`);

const NODE_BUILTINS = [
  `assert`,
  `buffer`,
  `child_process`,
  `cluster`,
  `crypto`,
  `dgram`,
  `dns`,
  `domain`,
  `events`,
  `fs`,
  `http`,
  `https`,
  `net`,
  `node:url`,
  `os`,
  `path`,
  `punycode`,
  `querystring`,
  `readline`,
  `stream`,
  `string_decoder`,
  `timers`,
  `tls`,
  `tty`,
  `url`,
  `util`,
  `v8`,
  `vm`,
  `zlib`,
];

const trimStart = (s) => {
  return s.replace(/^\s+/, ``);
};

const trimEnd = (s) => {
  return s.replace(/\s+$/, ``);
};

const isNamespaceImportNode = (node) => {
  return (
    node.specifiers &&
    node.specifiers.some((specifier) => {
      return specifier.type === `ImportNamespaceSpecifier`;
    })
  );
};

/**
 * Return the group for the given module:
 *
 * - sideEffect: import with a side effect (e.g. `import 'foo'`
 * - builtin: Node builtin module
 * - external: 3rd party module
 * - alias: Path alias from something like Webpack
 * - parent: Relative path pointing to a parent module
 * - sibling: Relative path pointing to a sibling module
 * - index: Reference to the index file in the current directory
 */
const getModuleType = (node, aliases) => {
  if (!node.specifiers || node.specifiers.length === 0) {
    return `sideEffect`;
  }

  const module = node.source.value;

  if (module === `./`) {
    return `index`;
  }

  if (module.startsWith(`..`)) {
    return `parent`;
  }

  if (module.startsWith(`.`)) {
    return `sibling`;
  }

  if (NODE_BUILTINS.includes(module)) {
    return `builtin`;
  }

  const isAlias = aliases.some((alias) => {
    return (
      typeof alias === `string` &&
      (module === alias || module.startsWith(`${alias}/`))
    );
  });

  if (isAlias) {
    return `alias`;
  }

  return `external`;
};

/**
 * Get the names of the modules at the end of their groups. We will need to
 * insert line breaks after these modules.
 */
const getBreakpoints = (importNodes, aliases) => {
  const breakpoints = [];
  let lastImportNode = null;
  let lastImportModuleType = null;

  importNodes.forEach((node) => {
    if (node.type === `ImportDeclaration`) {
      const moduleType = getModuleType(node, aliases);

      if (lastImportNode && moduleType !== lastImportModuleType) {
        breakpoints.push(lastImportNode.source.value);
      }

      lastImportModuleType = moduleType;
      lastImportNode = node;
    }
  });

  return breakpoints;
};

/**
 * Turn the transformed AST back into a JavaScript source code string.
 */
const generateCode = (content, ast, aliases, topCommentsEnd, bodyStart) => {
  const breakpoints = getBreakpoints(ast.program.body, aliases);

  let importsCode = generate.default(ast).code;

  // Make sure there are no blank lines
  importsCode = importsCode
    .split(os.EOL)
    .filter((l) => {
      return l;
    })
    .join(os.EOL);

  // Add extra lines between groups
  breakpoints.forEach((moduleName) => {
    importsCode = importsCode.replace(
      `'${moduleName}';`,
      `'${moduleName}';${os.EOL}`
    );
  });

  const headerCode = trimEnd(content.slice(0, topCommentsEnd));
  const bodyCode = trimStart(content.slice(bodyStart));

  let newContent = ``;

  if (headerCode) {
    newContent = `${headerCode}${os.EOL}`;
  }

  newContent = `${newContent}${importsCode}`;

  if (bodyCode) {
    newContent = `${newContent}${os.EOL}${os.EOL}${bodyCode}`;
  }

  return newContent;
};

/**
 * Sort two import specifiers based on their name.
 */
const sortSpecifiers = (nodeA, nodeB, collator) => {
  const aIsDefault = nodeA.type === `ImportDefaultSpecifier`;
  const bIsDefault = nodeB.type === `ImportDefaultSpecifier`;

  if (aIsDefault && bIsDefault) {
    return collator.compare(nodeA.local.name, nodeB.local.name);
  }

  if (aIsDefault) {
    return -1;
  }

  if (bIsDefault) {
    return 1;
  }

  if (nodeA.imported && nodeB.imported) {
    const imported = collator.compare(nodeA.imported.name, nodeB.imported.name);

    if (imported !== 0) {
      return imported;
    }
  }

  return collator.compare(nodeA.local.name, nodeB.local.name);
};

/**
 * Provide an intuitive ordering rank for the given module.
 */
const rankModule = (node, aliases) => {
  switch (getModuleType(node, aliases)) {
    case `sideEffect`:
      return 0;
    case `builtin`:
      return 100;
    case `external`:
      return 200;
    case `alias`:
      return 300;
    case `parent`:
      return 800 - node.source.value.match(/\./g).length;
    case `sibling`:
      return 900;
    default:
      return 1000;
  }
};

/**
 * Sort two import declarations based on their module.
 */
const sortModules = (nodeA, nodeB, aliases, collator) => {
  const aIsImport = nodeA.type === `ImportDeclaration`;
  const bIsImport = nodeB.type === `ImportDeclaration`;

  if (!aIsImport || !bIsImport) {
    return 0;
  }

  const nodeARank = rankModule(nodeA, aliases);
  const nodeBRank = rankModule(nodeB, aliases);

  if (nodeARank < nodeBRank) {
    return -1;
  }

  if (nodeARank > nodeBRank) {
    return 1;
  }

  // Do not sort `import 'foo'` declarations because they have side
  // effects so the order may matter
  if (getModuleType(nodeA, aliases) === `sideEffect`) {
    if (nodeA.start < nodeB.start) {
      return -1;
    }

    if (nodeA.start > nodeB.start) {
      return 1;
    }

    return 0;
  }

  const abcCompare = collator.compare(nodeA.source.value, nodeB.source.value);

  if (abcCompare !== 0) {
    return abcCompare;
  }

  if (nodeA.specifiers && nodeB.specifiers) {
    const isNamespaceImportA = isNamespaceImportNode(nodeA);
    const isNamespaceImportB = isNamespaceImportNode(nodeB);

    if (isNamespaceImportA && !isNamespaceImportB) {
      return -1;
    }
    if (!isNamespaceImportA && isNamespaceImportB) {
      return 1;
    }
  }

  if (!nodeA.specifiers && nodeB.specifiers) {
    return -1;
  }

  return abcCompare;
};

/**
 * Group specifiers for modules imported more than once.
 */
const collapseModules = (importNodes) => {
  const collapsedNodes = [];
  const importNodesByModule = {};
  const namespaceImportNodesByModule = {};

  importNodes.forEach((node) => {
    const specifiers = node.specifiers;

    if (specifiers) {
      const targetMapping = isNamespaceImportNode(node)
        ? namespaceImportNodesByModule
        : importNodesByModule;

      const module = node.source.value;

      if (!targetMapping[module]) {
        collapsedNodes.push(node);
        targetMapping[module] = node;
      } else {
        const baseNode = targetMapping[module];
        const baseSpecifiers = baseNode.specifiers;

        specifiers.forEach((specifier) => {
          const alreadyAdded = baseSpecifiers.some((baseSpecifier) => {
            return baseSpecifier.local.name === specifier.local.name;
          });

          if (!alreadyAdded) {
            baseSpecifiers.push(specifier);
          }
        });

        if (node.leadingComments) {
          baseNode.leadingComments = (baseNode.leadingComments || []).concat(
            node.leadingComments
          );
        }

        if (node.trailingComments) {
          baseNode.trailingComments = (baseNode.trailingComments || []).concat(
            node.trailingComments
          );
        }

        if (node.extra) {
          baseNode.extra = node.extra;
        }
      }
    }
  });

  return collapsedNodes;
};

/**
 * Get the range position of the start of the code body (i.e. the end of
 * the imports block).
 */
const getBodyStart = (importNodes) => {
  const lastNode = importNodes[importNodes.length - 1];
  const trailingComments = lastNode.trailingComments;

  let importsEnd;

  if (trailingComments && trailingComments.length > 0) {
    const lastComment = trailingComments[trailingComments.length - 1];
    importsEnd = lastComment.end;
  } else {
    importsEnd = lastNode.end;
  }

  // Body starts 1 character after the last character of the import block
  return importsEnd + 1;
};

/**
 * The Babel parser treats comments as belonging to both the line after
 * and the line before. When it renders, this can cause weird behavior.
 * For example, Babel turns this:
 *
 *   console.log(`foo`);
 *   // Comment above bar
 *   console.log(`bar`);
 *   // Comment above baz
 *   console.log(`baz`);
 *
 * Into:
 *
 *   console.log(`foo`); // Comment above bar
 *
 *   console.log(`bar`); // Comment above baz
 *
 *   console.log(`baz`);
 *
 * This function makes removes trailing and leading comments such that
 * Babel will generate code that makes sense.
 */
const cleanUpComments = (importNodes) => {
  const isTrailingComment = (node, comment) => {
    return (
      comment.loc.start.line >= node.loc.start.line &&
      comment.loc.end.line <= node.loc.end.line
    );
  };

  const isLeadingComment = (node, comment, prevNode) => {
    return (
      comment.loc.end.line < node.loc.start.line &&
      (!prevNode || !isTrailingComment(prevNode, comment))
    );
  };

  importNodes.forEach((node, i) => {
    const prevNode = i > 0 ? importNodes[i - 1] : null;

    if (node.leadingComments) {
      node.leadingComments = node.leadingComments.filter((comment) => {
        return isLeadingComment(node, comment, prevNode);
      });
    }

    if (node.trailingComments) {
      node.trailingComments = node.trailingComments.filter((comment) => {
        return isTrailingComment(node, comment, prevNode);
      });
    }
  });
};

/**
 * Get the beginning import declarations in the given list of nodes.
 */
const getTopImports = (nodes) => {
  const imports = [];

  for (const node of nodes) {
    if (![`ImportDeclaration`, `EmptyStatement`].includes(node.type)) {
      break;
    }

    imports.push(node);
  }

  return imports;
};

/**
 * Parse the given JS source code string into an AST.
 */
const parseContent = (content) => {
  const ast = babelParser.parse(content, {
    allowAwaitOutsideFunction: true,
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    errorRecovery: true,
    plugins: [
      `classProperties`,
      `dynamicImport`,
      `exportDefaultFrom`,
      `exportNamespaceFrom`,
      `objectRestSpread`,
      `jsx`,
      `typescript`,
    ],
    ranges: true,
    sourceType: `module`,
    strictMode: false,
  });

  // Do not move comments at the top of the file
  let topCommentsEnd = 0;

  if (ast.program.body.length > 0) {
    const topComments = ast.program.body[0].leadingComments || [];

    if (topComments.length > 0) {
      topCommentsEnd = topComments[topComments.length - 1].end;

      ast.program.body[0].leadingComments = [];
    }
  }

  return { ast, topCommentsEnd };
};

/**
 * Group and sort the imports in the given JavaScript source code string.
 */
const isort = (content, aliases = []) => {
  // For natural sorting of alphanumeric strings
  const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: `base`,
  });

  const { ast, topCommentsEnd } = parseContent(content);
  let importNodes = getTopImports(ast.program.body);

  cleanUpComments(importNodes);

  let newContent = content;

  if (importNodes.length > 0) {
    const bodyStart = getBodyStart(importNodes);

    importNodes = collapseModules(importNodes);

    importNodes.sort((a, b) => {
      return sortModules(a, b, aliases, collator);
    });

    importNodes.forEach((node) => {
      if (node.specifiers) {
        node.specifiers.sort((a, b) => {
          return sortSpecifiers(a, b, collator);
        });
      }
    });

    ast.program.body = importNodes;

    newContent = generateCode(content, ast, aliases, topCommentsEnd, bodyStart);
  }

  return newContent;
};

module.exports = isort;
