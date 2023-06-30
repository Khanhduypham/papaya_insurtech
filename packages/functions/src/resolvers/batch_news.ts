import { getRelatedByPublisherId } from "../dal/news_dal";

type AppSyncBatchEvent = {
  field: string;
  source: {
    [key: string]: any;
  };
};

export async function handler(event: AppSyncBatchEvent[]) {
  const result: any = [];
  for (let e of event) {
    const field = e.field;
    switch (field) {
      case "relatedNews":
        result.push(
          await getRelatedByPublisherId(e.source.id, e.source.publisherId)
        );
        break;
      default:
        break;
    }
  }
  return result;
}
