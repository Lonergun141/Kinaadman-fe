import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const backendOrigin =
  process.env.KINAADMAN_BACKEND_ORIGIN?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

function buildBackendUrl(request: NextRequest) {
  const backendPath = request.nextUrl.pathname.replace(/^\/api\/backend/, "");
  const target = new URL(`${backendOrigin}${backendPath}`);
  target.search = request.nextUrl.search;
  return target;
}

function buildForwardHeaders(request: NextRequest) {
  const headers = new Headers(request.headers);

  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  return headers;
}

async function proxyRequest(request: NextRequest) {
  const target = buildBackendUrl(request);
  const headers = buildForwardHeaders(request);
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text();

  const response = await fetch(target, {
    method: request.method,
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("transfer-encoding");
  responseHeaders.delete("connection");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest) {
  return proxyRequest(request);
}

export async function POST(request: NextRequest) {
  return proxyRequest(request);
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request);
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request);
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request);
}

export async function OPTIONS(request: NextRequest) {
  return proxyRequest(request);
}
