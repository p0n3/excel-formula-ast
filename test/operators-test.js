const { buildTree, stringify } = require('../');
const { tokenize } = require('@p0n3/excel-formula-tokenizer');
const { deepStrictEqual } = require('assert');
const builder = require('../lib/node-builder');

describe('operators', function() {
  describe('precendence', function() {
    it('1 + 2 >= 3 - 4', function() {
      const tree = buildTree(tokenize('1 + 2 >= 3 - 4'));

      deepStrictEqual(
        tree,
        builder.binaryExpression(
          '>=',
          builder.binaryExpression('+', builder.number(1), builder.number(2)),
          builder.binaryExpression('-', builder.number(3), builder.number(4)),
        ),
      );
      deepStrictEqual(stringify(tree), '1+2>=3-4');
    });

    it('1 + 2 & "a"', function() {
      const tree = buildTree(tokenize('1 + 2 & "a"'));

      deepStrictEqual(
        tree,
        builder.binaryExpression(
          '&',
          builder.binaryExpression('+', builder.number(1), builder.number(2)),
          builder.text('a'),
        ),
      );
      deepStrictEqual(stringify(tree), '1+2&"a"');
    });

    it('1 + 2 * 3', function() {
      const tree = buildTree(tokenize('1 + 2 * 3'));

      deepStrictEqual(
        tree,
        builder.binaryExpression(
          '+',
          builder.number(1),
          builder.binaryExpression('*', builder.number(2), builder.number(3)),
        ),
      );
      deepStrictEqual(stringify(tree), '1+2*3');
    });

    it('1 + 2 * 3', function() {
      const tree = buildTree(tokenize('1 + 2 * 3'));

      deepStrictEqual(
        tree,
        builder.binaryExpression(
          '+',
          builder.number(1),
          builder.binaryExpression('*', builder.number(2), builder.number(3)),
        ),
      );
      deepStrictEqual(stringify(tree), '1+2*3');
    });

    it('1 * 2 ^ 3', function() {
      const tree = buildTree(tokenize('1 * 2 ^ 3'));

      deepStrictEqual(
        tree,
        builder.binaryExpression(
          '*',
          builder.number(1),
          builder.binaryExpression('^', builder.number(2), builder.number(3)),
        ),
      );
      deepStrictEqual(stringify(tree), '1*2^3');
    });

    it('(1 * 2) ^ 3', function() {
      const tree = buildTree(tokenize('(1 * 2) ^ 3'));

      deepStrictEqual(
        tree,
        builder.binaryExpression(
          '^',
          builder.binaryExpression('*', builder.number(1), builder.number(2)),
          builder.number(3),
        ),
      );
      deepStrictEqual(stringify(tree), '(1*2)^3');
    });
  });

  // everything is left associative
  describe('associativity', function() {
    it('1 + 2 + 3', function() {
      const tree = buildTree(tokenize('1 + 2 + 3'));

      deepStrictEqual(
        tree,
        builder.binaryExpression(
          '+',
          builder.binaryExpression('+', builder.number(1), builder.number(2)),
          builder.number(3),
        ),
      );
      deepStrictEqual(stringify(tree), '1+2+3');
    });

    it('1 + (2 + 3)', function() {
      const tree = buildTree(tokenize('1 + (2 + 3)'));

      deepStrictEqual(
        tree,
        builder.binaryExpression(
          '+',
          builder.number(1),
          builder.binaryExpression('+', builder.number(2), builder.number(3)),
        ),
      );
      deepStrictEqual(stringify(tree), '1+2+3');
    });

    it('1 * (2 + 3)', function() {
      const tree = buildTree(tokenize('1 * (2 + 3)'));

      deepStrictEqual(
        tree,
        builder.binaryExpression(
          '*',
          builder.number(1),
          builder.binaryExpression('+', builder.number(2), builder.number(3)),
        ),
      );
      deepStrictEqual(stringify(tree), '1*(2+3)');
    });

    it('IF(O39,$M41,IF(O40,N43*(1-$M42)^(1/12),0))', function() {
      const tree = buildTree(tokenize('IF(O39,$M41,IF(O40,N43*(1-$M42)^(1/12),0))'));
      deepStrictEqual(stringify(tree), 'IF(O39,$M41,IF(O40,N43*(1-$M42)^(1/12),0))');
    });

    it('(2 + 3) * 1', function() {
      const tree = buildTree(tokenize('(2 + 3) * 1'));

      deepStrictEqual(
        tree,
        builder.binaryExpression(
          '*',
          builder.binaryExpression('+', builder.number(2), builder.number(3)),
          builder.number(1),
        ),
      );
      deepStrictEqual(stringify(tree), '(2+3)*1');
    });

    it('1 / 2 / 3', function() {
      const tree = buildTree(tokenize('1 / 2 / 3'));

      deepStrictEqual(
        tree,
        builder.binaryExpression(
          '/',
          builder.binaryExpression('/', builder.number(1), builder.number(2)),
          builder.number(3),
        ),
      );
      deepStrictEqual(stringify(tree), '1/2/3');
    });

    it('1 + SUM(A2:A23)', function() {
      const tree = buildTree(tokenize('1 + SUM(A2:A23)'));

      deepStrictEqual(
        tree,
        builder.binaryExpression(
          '+',
          builder.number(1),
          builder.functionCall(
            'SUM',
            {},
            builder.cellRange(builder.cell('A2', 'relative'), builder.cell('A23', 'relative')),
          ),
        ),
      );
      deepStrictEqual(stringify(tree), '1+SUM(A2:A23)');
    });
  });
});
