import fs from "node:fs/promises";
import path from "node:path";

const ROOT_DIR = process.cwd();
const API_DIR = path.join(ROOT_DIR, "src/lib/api");
const DOCS_DIR = path.join(ROOT_DIR, "docs");

const SERVICES = [
  {
    name: "user",
    title: "User Service API",
    sourceUrl:
      process.env.USER_SWAGGER_URL ?? "http://localhost:3001/docs-json",
    outputFile: path.join(API_DIR, "userApi.ts"),
    baseUrlEnv: "NEXT_PUBLIC_USER_API_BASE_URL",
    defaultBaseUrl: "http://localhost:3001",
  },
  {
    name: "order",
    title: "Order Service API",
    sourceUrl:
      process.env.ORDER_SWAGGER_URL ?? "http://localhost:3002/docs-json",
    outputFile: path.join(API_DIR, "orderApi.ts"),
    baseUrlEnv: "NEXT_PUBLIC_ORDER_API_BASE_URL",
    defaultBaseUrl: "http://localhost:3002",
  },
];

await fs.mkdir(API_DIR, { recursive: true });
await fs.mkdir(DOCS_DIR, { recursive: true });

const docs = await Promise.all(
  SERVICES.map(async (service) => {
    const response = await fetch(service.sourceUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${service.name} swagger: ${response.status} ${response.statusText}`,
      );
    }

    const doc = await response.json();

    return {
      ...service,
      doc,
    };
  }),
);

await fs.writeFile(path.join(API_DIR, "http.ts"), generateHttpFile(), "utf8");

for (const service of docs) {
  await fs.writeFile(service.outputFile, generateServiceFile(service), "utf8");
}

await fs.writeFile(
  path.join(DOCS_DIR, "swagger-api-inventory.md"),
  generateInventory(docs),
  "utf8",
);

console.log("Generated files:");
console.log("- src/lib/api/http.ts");
for (const service of docs) {
  console.log(`- ${path.relative(ROOT_DIR, service.outputFile)}`);
}
console.log("- docs/swagger-api-inventory.md");

function generateServiceFile(service) {
  const { doc, title, sourceUrl, baseUrlEnv, defaultBaseUrl, name } = service;
  const generatedAt = new Date().toISOString();
  const componentSchemas = doc.components?.schemas ?? {};
  const schemaNames = Object.keys(componentSchemas).sort();
  const parts = [];
  const emittedInlineTypes = new Set();
  const functionBlocks = [];

  parts.push(
    `/**`,
    ` * Auto-generated from ${title}`,
    ` * Source: ${sourceUrl}`,
    ` * Generated at: ${generatedAt}`,
    ` */`,
    ``,
    `import { createApiClient, buildPath, mergeQueryConfig, type ApiRequestConfig } from "./http";`,
    ``,
    `export const ${name}ApiClient = createApiClient(`,
    `  process.env.${baseUrlEnv} ?? "${defaultBaseUrl}",`,
    `);`,
    ``,
  );

  for (const schemaName of schemaNames) {
    parts.push(
      `export type ${schemaName} = ${typeFromSchema(componentSchemas[schemaName])};`,
      ``,
    );
  }

  for (const [rawPath, methods] of Object.entries(doc.paths ?? {})) {
    const sortedMethods = Object.entries(methods).sort(([methodA], [methodB]) =>
      methodA.localeCompare(methodB),
    );

    for (const [method, operation] of sortedMethods) {
      const baseName = pathToPascalCase(rawPath);
      const functionName = `${methodToFunctionPrefix(method)}${baseName}`;
      const responseTypeName = `${pascalCase(functionName)}Response`;
      const pathParamsTypeName = `${pascalCase(functionName)}PathParams`;
      const queryParamsTypeName = `${pascalCase(functionName)}QueryParams`;
      const requestBodyTypeName = `${pascalCase(functionName)}RequestBody`;

      const pathParams = getParameters(operation, "path");
      const queryParams = getParameters(operation, "query");

      if (pathParams.length) {
        parts.push(
          generateParamTypeBlock(pathParamsTypeName, pathParams),
          ``,
        );
      }

      if (queryParams.length) {
        parts.push(
          generateParamTypeBlock(queryParamsTypeName, queryParams),
          ``,
        );
      }

      const requestBodyType = getRequestBodyType(operation);
      if (requestBodyType?.kind === "inline") {
        const block = `export type ${requestBodyTypeName} = ${requestBodyType.type};`;

        if (!emittedInlineTypes.has(block)) {
          parts.push(block, ``);
          emittedInlineTypes.add(block);
        }
      }

      parts.push(
        `export type ${responseTypeName} = ${getResponseType(operation)};`,
        ``,
      );

      functionBlocks.push(
        generateFunctionBlock({
          clientName: `${name}ApiClient`,
          functionName,
          method,
          rawPath,
          summary: operation.summary,
          responseTypeName,
          pathParamsTypeName: pathParams.length ? pathParamsTypeName : null,
          queryParamsTypeName: queryParams.length ? queryParamsTypeName : null,
          requestBodyTypeName: requestBodyType
            ? requestBodyType.kind === "ref"
              ? requestBodyType.type
              : requestBodyTypeName
            : null,
        }),
      );
    }
  }

  parts.push(...functionBlocks.flatMap((block) => [block, ""]));

  return `${parts.join("\n").trim()}\n`;
}

function generateFunctionBlock(config) {
  const {
    clientName,
    functionName,
    method,
    rawPath,
    summary,
    responseTypeName,
    pathParamsTypeName,
    queryParamsTypeName,
    requestBodyTypeName,
  } = config;

  const signatureParts = [];
  const callArgs = [];

  if (pathParamsTypeName) {
    signatureParts.push(`pathParams: ${pathParamsTypeName}`);
  }

  if (queryParamsTypeName) {
    signatureParts.push(`query: ${queryParamsTypeName}`);
  }

  if (requestBodyTypeName) {
    signatureParts.push(`data: ${requestBodyTypeName}`);
  }

  signatureParts.push(`config?: ApiRequestConfig`);

  const resolvedPath = pathParamsTypeName
    ? `buildPath("${rawPath}", pathParams)`
    : `"${rawPath}"`;

  callArgs.push(resolvedPath);

  if (requestBodyTypeName) {
    callArgs.push("data");
  }

  if (queryParamsTypeName) {
    callArgs.push("mergeQueryConfig(query, config)");
  } else {
    callArgs.push("config");
  }

  const commentLines = summary
    ? [`/**`, ` * ${summary}`, ` */`]
    : [];

  return [
    ...commentLines,
    `export async function ${functionName}(`,
    `  ${signatureParts.join(",\n  ")},`,
    `): Promise<${responseTypeName}> {`,
    `  const response = await ${clientName}.${method.toLowerCase()}<${responseTypeName}>(`,
    `    ${callArgs.join(",\n    ")},`,
    `  );`,
    ``,
    `  return response.data;`,
    `}`,
  ].join("\n");
}

function generateParamTypeBlock(typeName, parameters) {
  const lines = parameters.map((parameter) => {
    const key = quoteProperty(parameter.name);
    const optional = parameter.required ? "" : "?";
    return `${key}${optional}: ${typeFromSchema(parameter.schema)};`;
  });

  return `export interface ${typeName} {\n${indent(lines.join("\n"))}\n}`;
}

function getParameters(operation, target) {
  return (operation.parameters ?? [])
    .filter((parameter) => parameter.in === target)
    .map((parameter) => ({
      name: parameter.name,
      required: parameter.required ?? false,
      schema: parameter.schema ?? {},
    }));
}

function getRequestBodyType(operation) {
  const schema = operation.requestBody?.content?.["application/json"]?.schema;

  if (!schema) {
    return null;
  }

  if (schema.$ref) {
    return {
      kind: "ref",
      type: refToTypeName(schema.$ref),
    };
  }

  return {
    kind: "inline",
    type: typeFromSchema(schema),
  };
}

function getResponseType(operation) {
  if (operation.responses?.["204"]) {
    return "void";
  }

  const successResponse =
    operation.responses?.["200"] ??
    operation.responses?.["201"] ??
    operation.responses?.["202"];

  if (!successResponse) {
    return "unknown";
  }

  const schema =
    successResponse.content?.["application/json"]?.schema ??
    successResponse.content?.["application/octet-stream"]?.schema;

  if (!schema) {
    return "unknown";
  }

  return typeFromSchema(schema);
}

function typeFromSchema(schema) {
  if (!schema) {
    return "unknown";
  }

  if (schema.$ref) {
    return refToTypeName(schema.$ref);
  }

  if (schema.enum?.length) {
    return withNullable(
      schema.enum.map((value) => JSON.stringify(value)).join(" | "),
      schema.nullable,
    );
  }

  if (schema.oneOf?.length) {
    return withNullable(
      schema.oneOf.map((item) => typeFromSchema(item)).join(" | "),
      schema.nullable,
    );
  }

  if (schema.anyOf?.length) {
    return withNullable(
      schema.anyOf.map((item) => typeFromSchema(item)).join(" | "),
      schema.nullable,
    );
  }

  if (schema.allOf?.length) {
    return withNullable(
      schema.allOf.map((item) => typeFromSchema(item)).join(" & "),
      schema.nullable,
    );
  }

  if (schema.type === "array") {
    const itemType = typeFromSchema(schema.items ?? {});
    return withNullable(`${wrapIfNeeded(itemType)}[]`, schema.nullable);
  }

  if (
    schema.type === "object" ||
    schema.properties ||
    schema.additionalProperties ||
    isPlainObject(schema.example)
  ) {
    return withNullable(objectTypeFromSchema(schema), schema.nullable);
  }

  if (schema.example !== undefined) {
    return withNullable(typeFromExample(schema.example), schema.nullable);
  }

  switch (schema.type) {
    case "string":
      return withNullable("string", schema.nullable);
    case "integer":
    case "number":
      return withNullable("number", schema.nullable);
    case "boolean":
      return withNullable("boolean", schema.nullable);
    default:
      return withNullable("unknown", schema.nullable);
  }
}

function objectTypeFromSchema(schema) {
  const properties = schema.properties ?? {};
  const required = new Set(schema.required ?? []);
  const lines = [];

  for (const [key, value] of Object.entries(properties)) {
    lines.push(
      `${quoteProperty(key)}${required.has(key) ? "" : "?"}: ${typeFromSchema(value)};`,
    );
  }

  if (schema.additionalProperties === true) {
    lines.push(`[key: string]: unknown;`);
  } else if (schema.additionalProperties) {
    lines.push(
      `[key: string]: ${typeFromSchema(schema.additionalProperties)};`,
    );
  }

  if (!lines.length && isPlainObject(schema.example)) {
    return objectTypeFromExample(schema.example);
  }

  if (!lines.length) {
    return "Record<string, never>";
  }

  return `{\n${indent(lines.join("\n"))}\n}`;
}

function typeFromExample(example) {
  if (Array.isArray(example)) {
    if (!example.length) {
      return "unknown[]";
    }

    const itemTypes = [...new Set(example.map((item) => typeFromExample(item)))];
    const itemType = itemTypes.length === 1 ? itemTypes[0] : itemTypes.join(" | ");
    return `${wrapIfNeeded(itemType)}[]`;
  }

  if (isPlainObject(example)) {
    return objectTypeFromExample(example);
  }

  if (typeof example === "string") {
    return "string";
  }

  if (typeof example === "number") {
    return "number";
  }

  if (typeof example === "boolean") {
    return "boolean";
  }

  if (example === null) {
    return "null";
  }

  return "unknown";
}

function objectTypeFromExample(example) {
  const lines = Object.entries(example).map(
    ([key, value]) => `${quoteProperty(key)}: ${typeFromExample(value)};`,
  );

  if (!lines.length) {
    return "Record<string, never>";
  }

  return `{\n${indent(lines.join("\n"))}\n}`;
}

function generateInventory(docs) {
  const lines = [
    `# Swagger API Inventory`,
    ``,
    `生成时间：${new Date().toISOString()}`,
    ``,
    `说明：当前 \`.codex/config.toml\` 中的 MCP 端口映射与真实后端服务不一致。此清单基于实际可访问的 Swagger 文档生成：`,
    ``,
    `- user-service: \`http://localhost:3001/docs-json\``,
    `- order-service: \`http://localhost:3002/docs-json\``,
    ``,
  ];

  for (const service of docs) {
    lines.push(`## ${service.title}`, ``);

    for (const [rawPath, methods] of Object.entries(service.doc.paths ?? {})) {
      const sortedMethods = Object.entries(methods).sort(([methodA], [methodB]) =>
        methodA.localeCompare(methodB),
      );

      for (const [method, operation] of sortedMethods) {
        lines.push(
          `- \`${method.toUpperCase()} ${rawPath}\`${operation.summary ? `: ${operation.summary}` : ""}`,
        );
      }
    }

    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

function generateHttpFile() {
  return `import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

export type ApiRequestConfig = AxiosRequestConfig;

export function createApiClient(baseURL: string): AxiosInstance {
  return axios.create({
    baseURL,
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function buildPath<TParams extends object>(
  template: string,
  params?: TParams,
) {
  if (!params) {
    return template;
  }

  const paramMap = params as Record<string, unknown>;

  return template.replace(/\\{([^}]+)\\}/g, (_, key) => {
    const value = paramMap[key];

    if (value === undefined || value === null) {
      throw new Error(\`Missing path param: \${key}\`);
    }

    return encodeURIComponent(String(value));
  });
}

export function mergeQueryConfig<TQuery extends object>(
  query: TQuery,
  config?: ApiRequestConfig,
): ApiRequestConfig {
  const queryMap = query as Record<string, unknown>;
  const currentParams =
    config?.params && typeof config.params === "object"
      ? (config.params as Record<string, unknown>)
      : {};

  return {
    ...config,
    params: {
      ...queryMap,
      ...currentParams,
    },
  };
}
`;
}

function methodToFunctionPrefix(method) {
  switch (method.toLowerCase()) {
    case "get":
      return "get";
    case "post":
      return "create";
    case "patch":
      return "update";
    case "put":
      return "replace";
    case "delete":
      return "delete";
    default:
      return method.toLowerCase();
  }
}

function pathToPascalCase(rawPath) {
  const tokens = rawPath
    .split("/")
    .filter(Boolean)
    .flatMap((segment) => {
      if (segment.startsWith("{") && segment.endsWith("}")) {
        return ["by", segment.slice(1, -1)];
      }

      return segment.split(/[^a-zA-Z0-9]+/).filter(Boolean);
    });

  return tokens.map((token) => pascalCase(token)).join("");
}

function pascalCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function refToTypeName(ref) {
  return ref.split("/").at(-1);
}

function indent(value, spaces = 2) {
  return value
    .split("\n")
    .map((line) => `${" ".repeat(spaces)}${line}`)
    .join("\n");
}

function quoteProperty(value) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value)
    ? value
    : JSON.stringify(value);
}

function wrapIfNeeded(value) {
  return value.includes(" | ") || value.includes(" & ")
    ? `(${value})`
    : value;
}

function withNullable(value, nullable) {
  return nullable ? `${value} | null` : value;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
