import { SQLWrapper, eq, gt, gte, lt, lte, ne } from 'drizzle-orm';

export const COUNT_OPERATORS = [
  '=', '!=', '>', '>=', '<', '<=', 'is_blank', 'is_not_blank'
] as const;

export type CountOperator = typeof COUNT_OPERATORS[number];

export function createCountFilter(
  operator: CountOperator,
  value: number = 0,
  countSubquery: SQLWrapper
): SQLWrapper | undefined {
  const operatorToCondition: Record<CountOperator, () => SQLWrapper> = {
    '=': () => eq(countSubquery, value),
    '!=': () => ne(countSubquery, value),
    '>': () => gt(countSubquery, value),
    '>=': () => gte(countSubquery, value),
    '<': () => lt(countSubquery, value),
    '<=': () => lte(countSubquery, value),
    'is_blank': () => eq(countSubquery, 0),
    'is_not_blank': () => gt(countSubquery, 0)
  };

  return operatorToCondition[operator]?.() || undefined;
}
