export function onRequest(context) {
  return new Response("Hello from Cloudflare Pages Functions!", {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}
