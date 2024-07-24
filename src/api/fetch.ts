import {
  DeleteEndpoints,
  EndpointByMethod,
  EndpointParameters,
  GetEndpoints,
  PatchEndpoints,
  PostEndpoints,
  PutEndpoints,
} from "./api.ts";
import { z } from "zod";

type DefaultHeaders = Partial<{
  "Content-Type": string;
  Accept: string;
  Authorization: string;
}>;

type TypedHeaders = RequestInit["headers"] & DefaultHeaders;

const BASE_API_URL = `https://jsonplaceholder.typicode.com`;

function replacePlaceholders(
  text: string,
  values: { [key: string]: unknown }
): string {
  return text.replace(/{(\w+)}/g, (_, key) => {
    return String(values[key]) || "";
  });
}

function resolveUrl(path: string, params: EndpointParameters | undefined) {
  const url = `${BASE_API_URL}${path}`;

  if (!params) {
    return url;
  }

  const resolvedUrl =
    params.path !== undefined ? replacePlaceholders(url, params.path) : url;

  const query = "query" in params ? params.query : undefined;

  if (!query) {
    return resolvedUrl;
  }

  const searchParams = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });

  return `${resolvedUrl}?${searchParams.toString()}`;
}

type ValuesOfType<T> = T extends { [K: string]: infer U } ? U : never;
type Endpoints = ValuesOfType<ValuesOfType<EndpointByMethod>>;

export async function fetchFromApi<EP extends Endpoints>(
  endpoint: EP,
  parameters: z.infer<EP["parameters"]>,
  options?: { headers?: TypedHeaders }
): Promise<z.infer<EP["response"]>> {
  const validatedParams = parameters
    ? endpoint.parameters.parse(parameters)
    : parameters;

  const url = resolveUrl(endpoint.path.value, validatedParams);

  const payload = validatedParams
    ? "body" in validatedParams
      ? JSON.stringify(validatedParams.body)
      : undefined
    : undefined;

  return fetch(url, {
    method: endpoint.method.value,
    headers: options?.headers,
    body: payload,
  })
    .then((response) => response.json())
    .then((unknownResponse) => {
      const validatedResponse = endpoint.response.parse(unknownResponse);
      return validatedResponse;
    });
}

class ApiClient {
  baseUrl: string = "";

  constructor(public options: { headers?: TypedHeaders }) {
    this.options = options;
  }

  public setBaseUrl(newBaseUrl: string) {
    this.baseUrl = newBaseUrl;
    return this;
  }

  public get<
    TPath extends keyof GetEndpoints,
    TEndpoint extends GetEndpoints[TPath]
  >(
    path: TPath,
    params: z.infer<TEndpoint["parameters"]>
  ): Promise<z.infer<EndpointByMethod["get"][TPath]["response"]>> {
    return fetchFromApi(getEndpointConfig("get", path), params);
  }

  public post<
    TPath extends keyof PostEndpoints,
    TEndpoint extends PostEndpoints[TPath]
  >(
    path: TPath,
    params: z.infer<TEndpoint["parameters"]>
  ): Promise<z.infer<EndpointByMethod["post"][TPath]["response"]>> {
    return fetchFromApi(getEndpointConfig("post", path), params);
  }

  public patch<
    TPath extends keyof PatchEndpoints,
    TEndpoint extends PatchEndpoints[TPath]
  >(
    path: TPath,
    params: z.infer<TEndpoint["parameters"]>
  ): Promise<z.infer<EndpointByMethod["patch"][TPath]["response"]>> {
    return fetchFromApi(getEndpointConfig("patch", path), params);
  }

  public put<
    TPath extends keyof PutEndpoints,
    TEndpoint extends PutEndpoints[TPath]
  >(
    path: TPath,
    params: z.infer<TEndpoint["parameters"]>
  ): Promise<z.infer<EndpointByMethod["put"][TPath]["response"]>> {
    return fetchFromApi(getEndpointConfig("put", path), params);
  }

  public delete<
    TPath extends keyof DeleteEndpoints,
    TEndpoint extends DeleteEndpoints[TPath]
  >(
    path: TPath,
    params: z.infer<TEndpoint["parameters"]>
  ): Promise<z.infer<EndpointByMethod["delete"][TPath]["response"]>> {
    return fetchFromApi(getEndpointConfig("delete", path), params);
  }
}

export const apiClient = new ApiClient({
  headers: {
    Accept: "asd",
    Authorization: "Bearer bla",
  },
});

export function getEndpointConfig<
  M extends keyof EndpointByMethod,
  P extends keyof EndpointByMethod[M]
>(m: M, p: P): EndpointByMethod[M][P] {
  return EndpointByMethod[m][p];
}
