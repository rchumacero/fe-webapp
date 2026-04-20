/**
 * Base Interface for all Use Cases (Application Layer)
 * Following Clean Architecture / DDD patterns.
 */
export interface UseCase<I, O> {
  execute(input: I): Promise<O> | O;
}
