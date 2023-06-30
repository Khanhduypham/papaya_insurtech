import { expect, vi, it, Mock } from "vitest";
import { handler, AppSyncEvent } from "../src/resolvers/publisher";
import { getAllPublishers, getEvent } from "../src/dal";
import { EventsModel, PublishersModel } from "@news-app/core/model";

const event: AppSyncEvent[] = [
  {
    info: {
      fieldName: "getAllPublishers",
    },
    arguments: {
      newsId: "",
    },
    identity: {},
    request: {},
  },
  {
    info: {
      fieldName: "getAll",
    },
    arguments: {
      newsId: "",
    },
    identity: {},
    request: {},
  },
  {
    info: {
      fieldName: "receiveNewRead",
    },
    arguments: {
      newsId: "001",
    },
    identity: {},
    request: {
      headers: {
        "user-agent": "MAC A",
      },
    },
  },
];

const publishers: PublishersModel[] = [
  {
    id: "0001",
    name: "Publisher 001",
    email: "pub1@gmail.com",
  },
  {
    id: "0002",
    name: "Publisher 002",
    email: "pub2@gmail.com",
  },
];

const events: EventsModel[] = [
  {
    id: "1",
    news_id: "002",
    client: "MAC A",
    last_time: "1688099636633",
  },
  {
    id: "2",
    news_id: "001",
    client: "MAC A",
    last_time: "1688099636633",
  },
];

vi.mock("../src/dal");

it("Get all publishers success", async () => {
  (getAllPublishers as Mock).mockImplementation(() => {
    return publishers;
  });
  await expect(handler(event[0])).resolves.toEqual(publishers);
  vi.clearAllMocks();
});

it("Get all publishers failed when field was not correct", async () => {
  await expect(handler(event[1])).resolves.toEqual(null);
  vi.clearAllMocks();
});

it("Notify read news success", async () => {
  (getEvent as Mock).mockImplementation(() => {
    return events[0];
  });
  await expect(handler(event[2])).resolves.toEqual(true);
  vi.clearAllMocks();
});

it("Notify read news success when the device already read this news but last time > 5 mins", async () => {
  (getEvent as Mock).mockImplementation(() => {
    return events[1];
  });
  await expect(handler(event[2])).resolves.toEqual(true);
  vi.clearAllMocks();
});

it("Notify read news false when the device already read this news with last time < 5 mins", async () => {
  (getEvent as Mock).mockImplementation(() => {
    return events[1];
  });
  const date = new Date(1688099636643);
  vi.setSystemTime(date);
  await expect(handler(event[2])).resolves.toEqual(false);
  vi.clearAllMocks();
});
