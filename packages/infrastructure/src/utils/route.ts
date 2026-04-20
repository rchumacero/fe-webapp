/**
 * Resolves route paths with parameter replacement
 * Example: getRoute('/contacts/:id', { id: 123 }) => '/contacts/123'
 */
export const getRoute = (route: string, params?: Record<string, string | number>): string => {
  if (!params) return route;
  
  let resolvedRoute = route;
  Object.entries(params).forEach(([key, value]) => {
    resolvedRoute = resolvedRoute.replace(`:${key}`, String(value));
  });
  
  return resolvedRoute;
};
