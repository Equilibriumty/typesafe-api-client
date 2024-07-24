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

interface TypedResponse<T> extends Response {
  json(): Promise<T>;
}

type DefaultHeaders = Partial<{
  "Content-Type": string;
  Accept: string;
  Authorization: string;
}>;

type TypedHeaders = RequestInit["headers"] & DefaultHeaders;

type TypedRequestInit = RequestInit & {
  headers?: TypedHeaders;
};

declare function fetch<T extends Endpoints>(
  url: RequestInfo | URL,
  init?: TypedRequestInit
  // NEED To THINK ABOut THE SUITABLE RETURN TYPE HERE
): Promise<TypedResponse<unknown>>;

function replacePlaceholders(
  text: string,
  values: { [key: string]: unknown }
): string {
  return text.replace(/{(\w+)}/g, (_, key) => {
    return String(values[key]) || "";
  });
}

function resolveUrl(
  baseUrl: string,
  path: string,
  params: EndpointParameters | undefined
) {
  const url = `${baseUrl}${path}`;

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
  options: { baseUrl: string; headers?: TypedHeaders }
): Promise<z.infer<EP["response"]>> {
  const validatedParams = parameters
    ? endpoint.parameters.parse(parameters)
    : parameters;

  const url = resolveUrl(options.baseUrl, endpoint.path.value, validatedParams);

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
  constructor(public options: { baseUrl: string; headers?: TypedHeaders }) {
    this.options = options;
  }

  public get<
    TPath extends keyof GetEndpoints,
    TEndpoint extends GetEndpoints[TPath]
  >(
    path: TPath,
    params: z.infer<TEndpoint["parameters"]>
  ): Promise<z.infer<EndpointByMethod["get"][TPath]["response"]>> {
    return fetchFromApi(getEndpointConfig("get", path), params, this.options);
  }

  public post<
    TPath extends keyof PostEndpoints,
    TEndpoint extends PostEndpoints[TPath]
  >(
    path: TPath,
    params: z.infer<TEndpoint["parameters"]>
  ): Promise<z.infer<EndpointByMethod["post"][TPath]["response"]>> {
    return fetchFromApi(getEndpointConfig("post", path), params, this.options);
  }

  public patch<
    TPath extends keyof PatchEndpoints,
    TEndpoint extends PatchEndpoints[TPath]
  >(
    path: TPath,
    params: z.infer<TEndpoint["parameters"]>
  ): Promise<z.infer<EndpointByMethod["patch"][TPath]["response"]>> {
    return fetchFromApi(getEndpointConfig("patch", path), params, this.options);
  }

  public put<
    TPath extends keyof PutEndpoints,
    TEndpoint extends PutEndpoints[TPath]
  >(
    path: TPath,
    params: z.infer<TEndpoint["parameters"]>
  ): Promise<z.infer<EndpointByMethod["put"][TPath]["response"]>> {
    return fetchFromApi(getEndpointConfig("put", path), params, this.options);
  }

  public delete<
    TPath extends keyof DeleteEndpoints,
    TEndpoint extends DeleteEndpoints[TPath]
  >(
    path: TPath,
    params: z.infer<TEndpoint["parameters"]>
  ): Promise<z.infer<EndpointByMethod["delete"][TPath]["response"]>> {
    return fetchFromApi(
      getEndpointConfig("delete", path),
      params,
      this.options
    );
  }
}

export const apiClient = new ApiClient({
  baseUrl: `https://jsonplaceholder.typicode.com`,
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
