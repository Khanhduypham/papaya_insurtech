import { expect, vi, it, Mock } from "vitest";
import { handler } from "../src/resolvers/news";
import { getAll, getById, getByPublisherId } from "../src/dal";

const event: any = [
  {
    info: {
      fieldName: "getAllNews",
    },
    arguments: {
      createNewsRequest: {},
    },
    identity: {},
  },
  {
    info: {
      fieldName: "getAllOfNews",
    },
    arguments: {},
    identity: {},
  },
  {
    info: {
      fieldName: "getNews",
    },
    arguments: {},
    identity: {
      id: "ABC",
    },
  },
  {
    info: {
      fieldName: "getNewsDetails",
    },
    arguments: {
      newsId: "ABC",
    },
    identity: {
      id: "ABC",
    },
  },
];

const news: any[] = [
  {
    id: "0001",
    title: "News 001",
    content: "News content 001",
    publisherId: "0001",
    publisherName: "Duy Pham",
    createdDate: new Date(),
    updatedDate: new Date(),
  },
  {
    id: "0002",
    title: "News 002",
    content: "News content 002",
    publisherId: "0001",
    publisherName: "Duy Pham",
    createdDate: new Date(),
    updatedDate: new Date(),
  },
];

vi.mock("../src/dal");

it("Get all news success", async () => {
  (getAll as Mock).mockImplementation(() => {
    return news;
  });
  await expect(handler(event[0])).resolves.toEqual(news);
  vi.clearAllMocks();
});

it("Get all news failed when field was not correct", async () => {
  await expect(handler(event[1])).resolves.toEqual(null);
  vi.clearAllMocks();
});

it("Get all news of publisher success", async () => {
  (getByPublisherId as Mock).mockImplementation(() => {
    return news;
  });
  await expect(handler(event[2])).resolves.toEqual(news);
  vi.clearAllMocks();
});

it("Get news by id success", async () => {
  (getById as Mock).mockImplementation(() => {
    return news;
  });
  await expect(handler(event[3])).resolves.toEqual(news[0]);
  vi.clearAllMocks();
});

it("Get news by id return not found", async () => {
  (getById as Mock).mockImplementation(() => {
    return [];
  });
  await expect(handler(event[3])).rejects.toEqual(new Error("Not found"));
  vi.clearAllMocks();
});
