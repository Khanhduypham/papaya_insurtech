import { db } from "@news-app/core/index";
import { PublishersModel } from "@news-app/core/model";

export const getAllPublishers = async (): Promise<PublishersModel[]> => {
  const result: any = db.selectFrom("publishers").selectAll().execute();
  return result;
};

export const createPublisher = async ({ id, name, email }: any) => {
  await db.insertInto("publishers").values({ id, name, email }).execute();
};
