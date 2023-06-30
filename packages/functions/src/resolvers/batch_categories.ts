import { getCategoriesByNewsId } from "src/dal";

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
      case "categories":
        result.push(await getCategoriesByNewsId(e.source.id));
        break;
      default:
        break;
    }
  }
  return result;
}
