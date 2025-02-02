const { buildTree, stringify } = require('../');
const { tokenize } = require('@p0n3/excel-formula-tokenizer');
const { deepStrictEqual } = require('assert');
const builder = require('../lib/node-builder');

describe('function calls', function() {
  it('SUM()', function() {
    const tree = buildTree(tokenize('SUM()'));

    deepStrictEqual(tree, builder.functionCall('SUM'));
    deepStrictEqual(stringify(tree), 'SUM()');
  });

  it('-SUM()', function() {
    const tree = buildTree(tokenize('-SUM()'));

    deepStrictEqual(tree, builder.unaryExpression('-', builder.functionCall('SUM')));
    deepStrictEqual(stringify(tree), '-SUM()');
  });

  it('SUM(1)', function() {
    const tree = buildTree(tokenize('SUM(1)'));

    deepStrictEqual(tree, builder.functionCall('SUM', {}, builder.number(1)));
    deepStrictEqual(stringify(tree), 'SUM(1)');
  });

  it('OFFSET(A1,,,1,10)', function() {
    const tree = buildTree(tokenize('OFFSET(A1,,,1,)'));

    deepStrictEqual(
      tree,
      builder.functionCall(
        'OFFSET',
        {},
        builder.cell('A1', 'relative'),
        builder.blank(),
        builder.blank(),
        builder.number(1),
      ),
    );
    deepStrictEqual(stringify(tree), 'OFFSET(A1,,,1)');
  });

  it('IF(\'Test Assumption\'!AA35=230,"Case 1", "Case 2")', function() {
    const tree = buildTree(tokenize('IF(\'Test Assumption\'!AA35=230,"Case 1", "Case 2")'));

    deepStrictEqual(
      tree,
      builder.functionCall(
        'IF',
        {},
        builder.binaryExpression('=', builder.cell('Test Assumption!AA35'), builder.number(230)),
        builder.text('Case 1'),
        builder.text('Case 2'),
      ),
    );
    deepStrictEqual(stringify(tree), 'IF(\'Test Assumption\'!AA35=230,"Case 1","Case 2")');
  });

  it('SUM(1, 2)', function() {
    const tree = buildTree(tokenize('SUM(1,2)'));

    deepStrictEqual(tree, builder.functionCall('SUM', {}, builder.number(1), builder.number(2)));
    deepStrictEqual(stringify(tree), 'SUM(1,2)');
  });

  it('SUM(1, SUM(2, 3))', function() {
    const tree = buildTree(tokenize('SUM(1,SUM(2,3))'));

    deepStrictEqual(
      tree,
      builder.functionCall('SUM', {}, builder.number(1), builder.functionCall('SUM', {}, builder.number(2), builder.number(3))),
    );
    deepStrictEqual(stringify(tree), 'SUM(1,SUM(2,3))');
  });

  it('SUM(10 / 4, SUM(2, 3))', function() {
    const tree = buildTree(tokenize('SUM(10 / 4, SUM(2, 3))'));

    deepStrictEqual(
      tree,
      builder.functionCall(
        'SUM',
        {},
        builder.binaryExpression('/', builder.number(10), builder.number(4)),
        builder.functionCall('SUM', {}, builder.number(2), builder.number(3)),
      ),
    );
    deepStrictEqual(stringify(tree), 'SUM(10/4,SUM(2,3))');
  });

  it('2 + SUM(1)', function() {
    const tree = buildTree(tokenize('2+SUM(1)'));

    deepStrictEqual(
      tree,
      builder.binaryExpression('+', builder.number(2), builder.functionCall('SUM', {}, builder.number(1))),
    );
    deepStrictEqual(stringify(tree), '2+SUM(1)');
  });

  it('2 + SUM(1, 2, 3, 4)', function() {
    const tree = buildTree(tokenize('2+ SUM(1, 2, 3, 4)'));

    deepStrictEqual(
      tree,
      builder.binaryExpression(
        '+',
        builder.number(2),
        builder.functionCall('SUM', {}, builder.number(1), builder.number(2), builder.number(3), builder.number(4)),
      ),
    );
    deepStrictEqual(stringify(tree), '2+SUM(1,2,3,4)');
  });

  it('SUM(2) + SUM(1)', function() {
    const tree = buildTree(tokenize('SUM(2) + SUM(1)'));

    deepStrictEqual(
      tree,
      builder.binaryExpression(
        '+',
        builder.functionCall('SUM', {}, builder.number(2)),
        builder.functionCall('SUM', {}, builder.number(1)),
      ),
    );
    deepStrictEqual(stringify(tree), 'SUM(2)+SUM(1)');
  });

  it('SUM(SUM(1), 2 + 3)', function() {
    const tree = buildTree(tokenize('SUM(SUM(1),2 + 3)'));

    deepStrictEqual(
      tree,
      builder.functionCall(
        'SUM',
        {},
        builder.functionCall('SUM', {}, builder.number(1)),
        builder.binaryExpression('+', builder.number(2), builder.number(3)),
      ),
    );
    deepStrictEqual(stringify(tree), 'SUM(SUM(1),2+3)');
  });

  it('{1,2;3,4}', function() {
    const tree = buildTree(tokenize('{1,2;3,4}'));

    deepStrictEqual(
        tree,
        builder.functionCall(
            'ARRAY',
            {},
            builder.functionCall('ARRAYROW', {}, builder.number(1), builder.number(2)),
            builder.functionCall('ARRAYROW', {}, builder.number(3), builder.number(4)),
        ),
    );
    deepStrictEqual(stringify(tree), '{1,2;3,4}');
  });

  it('@TRANSPOSE({1,2})', function() {
    const tree = buildTree(tokenize('@TRANSPOSE({1,2})'));

    deepStrictEqual(tree,
        builder.functionCall(
            'TRANSPOSE',
            {hasImplicitIntersectionOperator: true},
            builder.functionCall(
                'ARRAY',
                {},
                builder.functionCall('ARRAYROW', {}, builder.number(1), builder.number(2)),
            ),
        ));
    deepStrictEqual(stringify(tree), '@TRANSPOSE({1,2})');
  });

  it('Custom function transformer', function() {
    const tree = buildTree(tokenize('MIN(1)'));

    deepStrictEqual(stringify(tree, {
      isAcceptable: function(node) { return node.name === "MIN" },
      transform: function(node) { node.name = "MAX"; return node; }
    }), 'MAX(1)');
  });
});
