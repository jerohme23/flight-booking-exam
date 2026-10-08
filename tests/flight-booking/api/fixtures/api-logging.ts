import type { TestInfo } from "@playwright/test";

interface ApiExchange {
  method: string;
  url: string;
  status: number;
  requestBody?: unknown;
  responseBody: string;
}

export async function logApiExchange(
  testInfo: TestInfo,
  exchange: ApiExchange,
): Promise<void> {
  const details = [
    `${exchange.method} ${exchange.url}`,
    `Status: ${exchange.status}`,
    ...(exchange.requestBody === undefined
      ? []
      : [`Request body:\n${JSON.stringify(exchange.requestBody, null, 2)}`]),
    `Response body:\n${formatResponseBody(exchange.responseBody)}`,
  ].join("\n\n");

  console.log(`\n[API]\n${details}\n`);
  await testInfo.attach(`API ${exchange.method} ${new URL(exchange.url).pathname}`, {
    body: details,
    contentType: "text/plain",
  });
}

function formatResponseBody(responseBody: string): string {
  if (!responseBody) {
    return "(empty)";
  }

  try {
    return JSON.stringify(JSON.parse(responseBody), null, 2);
  } catch {
    return responseBody;
  }
}
