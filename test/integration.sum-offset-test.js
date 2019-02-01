const {buildTree} = require('../');
const {tokenize} = require('@modelmap/excel-formula-tokenizer');
const {deepStrictEqual} = require('assert');
const builder = require('../lib/node-builder');

const formula = '0-SUM(OFFSET(Q75,,,1,0-MIN($L72,-Admin!Q36)))/$L72';
const token = tokenize(formula);
const tree = buildTree(token);

describe('Integration: ' + formula, function() {
  it('builds tree', function() {
    deepStrictEqual(
      tree,
      builder.binaryExpression(
        '-',
        builder.number(0),
        builder.binaryExpression(
          '/',
          builder.functionCall(
            'SUM',
            builder.functionCall(
              'OFFSET',
              builder.cell('Q75', 'relative'),
              builder.blank(),
              builder.blank(),
              builder.number(1),
              builder.binaryExpression(
                '-',
                builder.number(0),
                builder.functionCall(
                  'MIN',
                  builder.cell('$L72', 'mixed'),
                  builder.unaryExpression('-', builder.cell('Admin!Q36')),
                ),
              ),
            ),
          ),
          builder.cell('$L72', 'mixed'),
        ),
      ),
    );
  });
});
