import { expect, vi, it, Mock } from "vitest";
import { handler, AppSyncEvent } from "../src/resolvers/category";
import { getAllCategories } from "../src/dal";
import { CategoriesModel } from "@news-app/core/model";

const event: AppSyncEvent[] = [
  {
    info: {
      fieldName: "getAllCategories",
    },
    arguments: {},
    identity: {},
  },
  {
    info: {
      fieldName: "getAllCategory",
    },
    arguments: {},
    identity: {},
  },
];

const categories: CategoriesModel[] = [
  {
    id: "0001",
    name: "Category 001",
  },
  {
    id: "0002",
    name: "Category 002",
  },
];

vi.mock("../src/dal");

it("Get all categories success", async () => {
  (getAllCategories as Mock).mockImplementation(() => {
    return categories;
  });
  await expect(handler(event[0])).resolves.toEqual(categories);
  vi.clearAllMocks();
});

it("Get all categories failed when field was not correct", async () => {
  await expect(handler(event[1])).resolves.toEqual(null);
  vi.clearAllMocks();
});
