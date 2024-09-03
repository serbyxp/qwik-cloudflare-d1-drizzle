import type { RequestHandler } from "@builder.io/qwik-city";
//
import { streamImageFromUrl } from "~/routes/api/streams";
import { getProfileImageUrlUseCase } from "~/use-cases/users";

export const onGet: RequestHandler = async (ev) => {
  try {
    const userId = ev.params.userId;

    if (!ev.params.imageId) {
      throw ev.json(400, { error: "Image ID is required" });
    }

    const url =
      ev.params.imageId === "default"
        ? `${ev.env.get("ORIGIN")}/group.jpeg`
        : await getProfileImageUrlUseCase({
            userId: userId,
            imageId: ev.params.imageId,
          });

    streamImageFromUrl(url, ev);
  } catch (error) {
    const err = error as Error;
    throw ev.json(400, { error: err.message });
  }
};
