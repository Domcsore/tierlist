interface IRouteResponse<Type> {
  code: number;
  data: Type | null;
  errorMessage: string | null;
}

export {
  IRouteResponse
}