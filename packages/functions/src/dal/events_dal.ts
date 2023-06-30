import { db } from "@news-app/core/index";
import { v4 } from "uuid";

export const createEvent = async (newsId: string, client: string) => {
  await db
    .insertInto("events")
    .values({
      id: v4(),
      news_id: newsId,
      client: client,
      last_time: new Date().getTime().toString(),
    })
    .executeTakeFirst();
};

export const updateEventLastTime = async (id: string) => {
  await db
    .updateTable("events")
    .set({ last_time: new Date().getTime().toString() })
    .where("id", "=", id)
    .executeTakeFirst();
};

export const getEvent = async (newsId: string, client: string) => {
  return await db
    .selectFrom("events")
    .selectAll()
    .where("news_id", "=", newsId)
    .where("client", "=", client)
    .executeTakeFirst();
};
