function stringify(node) {
  switch (node.type) {
    case 'cell':
      const m = node.key.match(/^(.+)\!([^\!]+)$/);
      if (m) {
        let sheet = m[1];
        const address = m[2];
        sheet = sheet.replace(/^'(.+)'$/, '$1');
        sheet = sheet.replace("'", "''");
        if (/[\s\!"']/.test(sheet)) {
          sheet = "'" + sheet + "'";
        }
        return sheet + '!' + address;
      }
      return node.key;
    case 'cell-range':
      return [stringify(node.left), stringify(node.right)].join(':');
    case 'function':
      return [node.name, '(', node.arguments.map(stringify).join(','), ')'].join('');
    case 'binary-expression':
      return [stringify(node.left), stringify(node.right)].join(node.operator);
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
