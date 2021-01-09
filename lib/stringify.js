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
      return [node.name, '(', node.arguments.map(stringify).join(','), ')'].join('');
    case 'binary-expression':
      return [stringify(node.left), stringify(node.right)].join(
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

module.exports = stringify;
