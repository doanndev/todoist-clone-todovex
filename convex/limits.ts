// Every list query returns at most this many documents, so a table that grows
// without bound can never make a query unbounded.
export const LIST_LIMIT = 2000;
