import type { RequestHandler } from "@builder.io/qwik-city";
import { streamImageFromUrl } from "~/routes/api/streams";
import { getCurrentUser } from "~/lib/session";
import { getGroupImageUrlUseCase } from "~/use-cases/files";

export const onGet: RequestHandler = async (ev) => {
  try {
    const user = await getCurrentUser(ev.cookie);

    const url =
      ev.params.imageId === "default"
        ? `${ev.env.get("ORIGIN")}/group.jpeg`
        : await getGroupImageUrlUseCase(user, {
            groupId: ev.params.groupId,
            imageId: ev.params.imageId,
          });

    streamImageFromUrl(url, ev);
  } catch (error) {
    const err = error as Error;
    throw ev.json(400, { error: err.message });
  }
};
