import * as TOKENS from 'excel-formula-tokenizer';
export type Node =
  | BinaryExpressionNode
  | UnaryExpressionNode
  | FunctionNode
  | NumberNode
  | CellNode
  | LogicalNode
  | TextNode
  | CellRangeNode
  | BlankNode;

export interface BinaryExpressionNode {
  type: 'binary-expression';
  operator: '>' | '<' | '=' | '>=' | '<=' | '+' | '-' | '&';
  left: Node;
  right: Node;
}
export interface UnaryExpressionNode {
  type: 'unary-expression';
  operator: '+' | '-';
  operand: Node;
}
export interface FunctionNode {
  type: 'function';
  name: string;
  arguments: Node[];
  attributes: {};
}
export interface NumberNode {
  type: 'number';
  value: number;
}
export interface CellNode {
  type: 'cell';
  refType?: 'relative' | 'mixed' | 'absolute';
  key: string;
}
export interface CellRangeNode {
  type: 'cell-range';
  left: Node;
  right: Node;
}
export interface LogicalNode {
  type: 'logical';
  value: boolean;
}
export interface TextNode {
  type: 'text';
  value: string;
}
export interface BlankNode {
  type: 'blank';
}
export interface CustomFunctionTransformer {
  isAcceptable(node: FunctionNode): boolean;
  transform(node: FunctionNode): FunctionNode;
}
declare function buildTree(tokens: TOKENS.Token[]): Node;
export interface Visitor {
  enterCell?(node: CellNode): void;
  exitCell?(node: CellNode): void;

  enterCellRange?(node: CellRangeNode): void;
  exitCellRange?(node: CellRangeNode): void;

  enterFunction?(node: FunctionNode): void;
  exitFunction?(node: FunctionNode): void;

  enterNumber?(node: NumberNode): void;
  exitNumber?(node: NumberNode): void;

  enterText?(node: TextNode): void;
  exitText?(node: TextNode): void;

  enterLogical?(node: LogicalNode): void;
  exitLogical?(node: LogicalNode): void;

  enterBinaryExpression?(node: BinaryExpressionNode): void;
  exitBinaryExpression?(node: BinaryExpressionNode): void;

  enterUnaryExpression?(node: UnaryExpressionNode): void;
  exitUnaryExpression?(node: UnaryExpressionNode): void;
}
declare function visit(tree: Node, visitor: Visitor): void;
declare function stringify(node: Node, customTransformer?: CustomFunctionTransformer): string;
