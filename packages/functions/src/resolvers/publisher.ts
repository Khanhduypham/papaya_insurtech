import { PublishersModel } from "@news-app/core/model";
import {
  createEvent,
  getAllPublishers as getAll,
  getEvent,
  updateEventLastTime,
} from "../dal";

export type AppSyncEvent = {
  info: {
    fieldName: string;
  };
  arguments: {
    newsId?: string;
  };
  identity: {};
  request: {
    headers?: {
      "user-agent": string;
    };
  };
};

export async function handler(event: AppSyncEvent) {
  switch (event.info.fieldName) {
    case "getAllPublishers":
      return await getAllPublishers();
    case "receiveNewRead":
      return await notifyReadNews(
        event.arguments.newsId || "",
        event.request.headers?.["user-agent"] || ""
      );
    case "notifyReadNews":
      break;
    default:
      return null;
  }
}

const getAllPublishers = async (): Promise<PublishersModel[]> => {
  return await getAll();
};

const notifyReadNews = async (
  newsId: string,
  userAgent: string
): Promise<Boolean> => {
  const event = await getEvent(newsId, userAgent);
  if (!event) {
    await createEvent(newsId, userAgent);
    return true;
  } else {
    const diff = Math.abs(
      (new Date().getTime() - new Date(Number(event.last_time)).getTime()) /
        1000
    );
    if (diff < 300) {
      return false;
    }

    await updateEventLastTime(event.id);
    return true;
  }
};
