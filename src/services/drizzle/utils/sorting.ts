import { SQL, asc, desc } from 'drizzle-orm';
import { PgColumn } from 'drizzle-orm/pg-core';
import { SortOrder } from 'src/api/routes/schemas/SortSchema';

type SortExpression = SQL<unknown> | PgColumn<any>;

type SortExpressionFn = (direction: typeof desc | typeof asc) => SortExpression;

export function createSortBuilder<T extends string>(expressions: Record<T, SortExpressionFn>) {
  return (field: T, order: SortOrder = 'asc'): SortExpression => {
    const direction = order === 'asc' ? asc : desc;
    return expressions[field](direction);
  };
}
