import assert from "node:assert/strict";
import test from "node:test";

const baseUrl = process.env.TEST_BASE_URL ?? "http://127.0.0.1:8787";
const fileName = "ScrollBoost-v1.0.0-win-x64.zip";
const downloadUrl = new URL(`/download/${fileName}`, baseUrl);

test("exposes the public release as a downloadable file", async () => {
  const response = await fetch(downloadUrl, {
    method: "HEAD",
    redirect: "manual",
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-length"), "47319294");
  assert.equal(response.headers.get("content-type"), "application/octet-stream");
  assert.equal(response.headers.get("accept-ranges"), "bytes");
  assert.equal(
    response.headers.get("content-disposition"),
    `attachment; filename="${fileName}"`,
  );
});

test("supports resuming an interrupted download with a byte range", async () => {
  const response = await fetch(downloadUrl, {
    headers: { Range: "bytes=0-15" },
    redirect: "manual",
  });

  assert.equal(response.status, 206);
  assert.equal(response.headers.get("content-range"), "bytes 0-15/47319294");
  assert.equal(response.headers.get("content-length"), "16");
  assert.equal((await response.arrayBuffer()).byteLength, 16);
});

test("rejects methods that cannot download a release", async () => {
  const response = await fetch(downloadUrl, {
    method: "POST",
    redirect: "manual",
  });

  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET, HEAD");
});

test("points both visible download buttons at the same-origin route", async () => {
  const response = await fetch(baseUrl);
  const html = await response.text();
  const expectedHref = `href="/download/${fileName}"`;

  assert.equal(response.status, 200);
  assert.equal(html.split(expectedHref).length - 1, 2);
});
