import type { RequestEvent } from "@builder.io/qwik-city";

export async function streamImageFromUrl(
  url: string,
  { json, send }: RequestEvent
) {
  const fetchResponse = await fetch(url);

  if (!fetchResponse.ok) {
    throw json(404, { error: "File not found" });
  }

  const file = fetchResponse.body;

  if (!file) {
    throw json(404, { error: "File not found" });
  }

  const contentType = fetchResponse.headers.get("content-type") || "image/*";
  const contentLength =
    Number(fetchResponse.headers.get("content-length")) || 0;

  const stream = new ReadableStream({
    start(controller) {
      const reader = file.getReader();
      const pump = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            controller.close();
            return;
          }
          controller.enqueue(value);
          pump();
        });
      };
      pump();
    },
  });

  send(
    new Response(stream, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(contentLength),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  );
}
