const { buildTree, stringify } = require('../');
const { tokenize } = require('@p0n3/excel-formula-tokenizer');
const { deepStrictEqual } = require('assert');
const builder = require('../lib/node-builder');

describe('basic expressions', function() {
  it('1', function() {
    const tree = buildTree(tokenize('1'));

    deepStrictEqual(tree, builder.number(1));
    deepStrictEqual(stringify(tree), '1');
  });

  it('1E-2', function() {
    const tree = buildTree(tokenize('1E-2'));

    deepStrictEqual(tree, builder.number(0.01));
    deepStrictEqual(stringify(tree), '0.01');
  });

  it('10%', function() {
    const tree = buildTree(tokenize('10%'));

    deepStrictEqual(tree, builder.number(0.1));
    deepStrictEqual(stringify(tree), '0.1');
  });

  it('-1', function() {
    const tree = buildTree(tokenize('-1'));

    deepStrictEqual(tree, builder.unaryExpression('-', builder.number(1)));
    deepStrictEqual(stringify(tree), '-1');
  });

  it('---1', function() {
    const tree = buildTree(tokenize('---1'));

    deepStrictEqual(
      tree,
      builder.unaryExpression('-', builder.unaryExpression('-', builder.unaryExpression('-', builder.number(1)))),
    );
    deepStrictEqual(stringify(tree), '---1');
  });

  it('"abc"', function() {
    const tree = buildTree(tokenize('"abc"'));

    deepStrictEqual(tree, builder.text('abc'));
    deepStrictEqual(stringify(tree), '"abc"');
  });

  it('TRUE', function() {
    const tree = buildTree(tokenize('TRUE'));

    deepStrictEqual(tree, builder.logical(true));
    deepStrictEqual(stringify(tree), 'TRUE');
  });

  it('1 + 2', function() {
    const tree = buildTree(tokenize('1 + 2'));

    deepStrictEqual(tree, builder.binaryExpression('+', builder.number(1), builder.number(2)));
    deepStrictEqual(stringify(tree), '1+2');
  });

  it('-1 + 2', function() {
    const tree = buildTree(tokenize('-1 + 2'));

    deepStrictEqual(
      tree,
      builder.binaryExpression('+', builder.unaryExpression('-', builder.number(1)), builder.number(2)),
    );
    deepStrictEqual(stringify(tree), '-1+2');
  });

  it('"a" & "b"', function() {
    const tree = buildTree(tokenize('"a" & "b"'));

    deepStrictEqual(tree, builder.binaryExpression('&', builder.text('a'), builder.text('b')));
    deepStrictEqual(stringify(tree), '"a"&"b"');
  });

  it('1 <> "b"', function() {
    const tree = buildTree(tokenize('1 <> "b"'));

    deepStrictEqual(tree, builder.binaryExpression('<>', builder.number(1), builder.text('b')));
    deepStrictEqual(stringify(tree), '1<>"b"');
  });
});
