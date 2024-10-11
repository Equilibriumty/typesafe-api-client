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
  "Content-Type": MimeTypes;
  Accept: MimeTypes;
  Authorization: `Bearer` | (string & Record<never, never>);
}>;

interface TypedResponse<T> extends Response {
  json(): Promise<T>;
}

type TypedRequestInit = RequestInit & {
  headers?: TypedHeaders;
};

declare function fetch<T extends Endpoints>(
  url: RequestInfo | URL,
  init?: TypedRequestInit
): Promise<TypedResponse<T>>;

type TypedHeaders = RequestInit["headers"] & DefaultHeaders;

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
    .then((data) => {
      const validatedResponse = endpoint.response.parse(data.response);
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
    Accept: "application/json",
    Authorization: "Bearer",
  },
});

export function getEndpointConfig<
  M extends keyof EndpointByMethod,
  P extends keyof EndpointByMethod[M]
>(m: M, p: P): EndpointByMethod[M][P] {
  return EndpointByMethod[m][p];
}

type MimeTypes =
  | ".jpg"
  | ".midi"
  | "XML"
  | "application/epub+zip"
  | "application/gzip"
  | "application/java-archive"
  | "application/json"
  | "application/ld+json"
  | "application/msword"
  | "application/octet-stream"
  | "application/ogg"
  | "application/pdf"
  | "application/php"
  | "application/rtf"
  | "application/vnd.amazon.ebook"
  | "application/vnd.apple.installer+xml"
  | "application/vnd.mozilla.xul+xml"
  | "application/vnd.ms-excel"
  | "application/vnd.ms-fontobject"
  | "application/vnd.ms-powerpoint"
  | "application/vnd.oasis.opendocument.presentation"
  | "application/vnd.oasis.opendocument.spreadsheet"
  | "application/vnd.oasis.opendocument.text"
  | "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "application/vnd.rar"
  | "application/vnd.visio"
  | "application/x-abiword"
  | "application/x-bzip"
  | "application/x-bzip2"
  | "application/x-csh"
  | "application/x-freearc"
  | "application/x-sh"
  | "application/x-shockwave-flash"
  | "application/x-tar"
  | "application/x-7z-compressed"
  | "application/xhtml+xml"
  | "application/zip"
  | "audio/aac"
  | "audio/mpeg"
  | "audio/ogg"
  | "audio/opus"
  | "audio/wav"
  | "audio/webm"
  | "font/otf"
  | "font/ttf"
  | "font/woff"
  | "font/woff2"
  | "image/bmp"
  | "image/gif"
  | "image/png"
  | "image/svg+xml"
  | "image/tiff"
  | "image/vnd.microsoft.icon"
  | "image/webp"
  | "text/calendar"
  | "text/css"
  | "text/csv"
  | "text/html"
  | "text/javascript"
  | "text/plain"
  | "video/3gpp"
  | "video/3gpp2"
  | "video/mp2t"
  | "video/mpeg"
  | "video/ogg"
  | "video/webm"
  | "video/x-msvideo";
