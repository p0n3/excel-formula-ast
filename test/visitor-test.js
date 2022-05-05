const {deepStrictEqual} = require('assert');
const builder = require('../lib/node-builder');
const {visit} = require('../');

describe('visiting', function () {
  it('cell node', function () {
    const recorder = createRecorder();
    const A1 = builder.cell('A1', 'relative');

    visit(A1, recorder);

    deepStrictEqual(recorder.calls, [
      ['enterCell', A1],
      ['exitCell', A1]
    ]);
  });

  it('cell range node', function () {
    const recorder = createRecorder();
    const A1 = builder.cell('A1', 'relative');
    const A2 = builder.cell('A2', 'relative');
    const cellRange = builder.cellRange(A1, A2);

    visit(cellRange, recorder);

    deepStrictEqual(recorder.calls, [
      ['enterCellRange', cellRange],
      ['enterCell', A1],
      ['exitCell', A1],
      ['enterCell', A2],
      ['exitCell', A2],
      ['exitCellRange', cellRange]
    ]);
  });

  it('number node', function () {
    const recorder = createRecorder();
    const number = builder.number(5);

    visit(number, recorder);

    deepStrictEqual(recorder.calls, [
      ['enterNumber', number],
      ['exitNumber', number]
    ]);
  });

  it('text node', function () {
    const recorder = createRecorder();
    const text = builder.text('asdf');

    visit(text, recorder);

    deepStrictEqual(recorder.calls, [
      ['enterText', text],
      ['exitText', text]
    ]);
  });

  it('logical node', function () {
    const recorder = createRecorder();
    const logical = builder.logical(true);

    visit(logical, recorder);

    deepStrictEqual(recorder.calls, [
      ['enterLogical', logical],
      ['exitLogical', logical]
    ]);
  });

  it('function node', function () {
    const recorder = createRecorder();
    const number = builder.number(3);
    const text = builder.text('dogs');
    const fn = builder.functionCall('get', {}, number, text);

    visit(fn, recorder);

    deepStrictEqual(recorder.calls, [
      ['enterFunction', fn],
      ['enterNumber', number],
      ['exitNumber', number],
      ['enterText', text],
      ['exitText', text],
      ['exitFunction', fn],
    ]);
  });

  it('binary expression node', function () {
    const recorder = createRecorder();
    const number = builder.number(3);
    const text = builder.text('dogs');
    const expr = builder.binaryExpression('+', number, text);

    visit(expr, recorder);

    deepStrictEqual(recorder.calls, [
      ['enterBinaryExpression', expr],
      ['enterNumber', number],
      ['exitNumber', number],
      ['enterText', text],
      ['exitText', text],
      ['exitBinaryExpression', expr],
    ]);
  });

  it('unary expression node', function () {
    const recorder = createRecorder();
    const number = builder.number(3);
    const expr = builder.unaryExpression('-', number);

    visit(expr, recorder);

    deepStrictEqual(recorder.calls, [
      ['enterUnaryExpression', expr],
      ['enterNumber', number],
      ['exitNumber', number],
      ['exitUnaryExpression', expr],
    ]);
  });
});

function createRecorder() {
  const callbackNames = [
    'Cell',
    'CellRange',
    'Function',
    'Number',
    'Text',
    'Logical',
    'BinaryExpression',
    'UnaryExpression'
  ];

  const calls = [];

  return callbackNames
    .reduce((all, name) => {
      attach(all, `enter${name}`);
      attach(all, `exit${name}`);
      return all;
    }, {calls});

  function attach(callbacks, name) {
    callbacks[name] = function(node) {
      calls.push([name, node]);
    };
  }
}
