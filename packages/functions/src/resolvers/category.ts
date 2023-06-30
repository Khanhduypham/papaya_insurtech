import { CategoriesModel } from "@news-app/core/model";
import { getAllCategories as getAll } from "../dal";
import { vi } from "vitest";
export type AppSyncEvent = {
  info: {
    fieldName: string;
  };
  arguments: {};
  identity: {};
};

export async function handler(event: AppSyncEvent) {
  switch (event.info.fieldName) {
    case "getAllCategories":
      return await getAllCategories();
    default:
      return null;
  }
}

const getAllCategories = async (): Promise<CategoriesModel[]> => {
  return await getAll();
};
