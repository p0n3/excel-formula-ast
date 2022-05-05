const { createBinaryOperator } = require('./build-tree');

function escapeAddress(address) {
  const m = address.match(/^(.+)\!([^\!]+)$/);
  if (!m) {
    return address;
  }
  let sheet = m[1];
  const addressLocal = m[2];
  sheet = sheet.replace(/^'(.+)'$/, '$1');
  sheet = sheet.replace("'", "''");
  if (/[\s\!"']/.test(sheet)) {
    sheet = "'" + sheet + "'";
  }
  return sheet + '!' + addressLocal;
}

function stringify(node) {
  switch (node.type) {
    case 'cell':
      return escapeAddress(node.key);
    case 'cell-range':
      const left = stringify(node.left);
      let right = stringify(node.right);
      const re = /^(.+)\!([^\!]+)$/;
      const m = left.match(re);
      if (m && right.indexOf(m[1] + '!') === 0) {
        right = right.replace(re, '$2');
      }
      return [left, right].join(':');
    case 'function':
      return formatFunction(node);
    case 'binary-expression':
      const strnode = (n) => {
        const str = stringify(n);
        if (n.type !== 'binary-expression') return str;
        const nop = createBinaryOperator(n.operator);
        const pop = createBinaryOperator(node.operator);
        return nop.precendence < pop.precendence ? `(${str})` : str;
      }
      const lstr = strnode(node.left);
      const rstr = strnode(node.right);

      return [lstr, rstr].join(
        { ' ': ' ', ',': ',' }[node.operator] || '' + node.operator + '',
      );
    case 'unary-expression':
      return node.operator + stringify(node.operand);
    case 'number':
      return String(node.value);
    case 'text':
      return '"' + node.value.replace('"', '""') + '"';
    case 'logical':
      return node.value ? 'TRUE' : 'FALSE';
  }
  return node.value || '';
}

function formatFunction(node) {
  if(node.name === "ARRAY")
    return ['{', node.arguments.map(stringify).join(";"), '}'].join('');
  if(node.name === "ARRAYROW")
    return [node.arguments.map(stringify).join(",")].join('');
  if(node.attributes.hasImplicitIntersectionOperator)
    return ['@', node.name, '(', node.arguments.map(stringify).join(','), ')'].join('');
  return [node.name, '(', node.arguments.map(stringify).join(','), ')'].join('');
}

module.exports = stringify;
