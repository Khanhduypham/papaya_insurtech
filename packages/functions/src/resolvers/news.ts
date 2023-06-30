import {
  GetAllNewsRequest,
  News,
  UpdateNewsRequest,
  createNewsRequest,
} from "src/domains";
import {
  create,
  deleteById,
  getAll,
  getById,
  getByPublisherId,
  updateById,
} from "../dal";
import { newsMapper } from "../mappers";

export type AppSyncEvent = {
  info: {
    fieldName: string;
  };
  arguments: {
    createNewsRequest: createNewsRequest;
    updateNewsRequest: UpdateNewsRequest;
    getAllNewsRequest: GetAllNewsRequest;
    newsId: string;
  };
  identity: {
    resolverContext: {
      id: string;
    };
  };
};

export async function handler(event: AppSyncEvent) {
  const publisherId = event.identity?.resolverContext?.id || "";
  switch (event.info.fieldName) {
    case "createNews":
      return await NewsFns.createNews(
        publisherId,
        event.arguments.createNewsRequest
      );
    case "getNews":
      return await NewsFns.getNews(publisherId);
    case "getNewsDetails":
      return await NewsFns.getNewsDetails(event.arguments.newsId);
    case "updateNews":
      return await NewsFns.updateNews(event.arguments.updateNewsRequest);
    case "deleteNews":
      return await NewsFns.deleteNews(event.arguments.newsId);
    case "getAllNews":
      return await NewsFns.getAllNews(event.arguments.getAllNewsRequest);
    default:
      return null;
  }
}

const NewsFns = {
  createNews: async (
    publisherId: string,
    createRequest: createNewsRequest
  ): Promise<News> => {
    const createResult = await create(publisherId, createRequest);
    return createResult;
  },
  getNews: async (publisherId: string): Promise<News[]> => {
    return await getByPublisherId(publisherId);
  },
  getAllNews: async (getRequest: GetAllNewsRequest): Promise<News[]> => {
    const result = await getAll(getRequest);
    return result;
  },
  getNewsDetails: async (newsId: string): Promise<News> => {
    const result = await getById(newsId);
    if (result.length > 0) {
      return result[0];
    }
    throw Error("Not found");
  },
  updateNews: async (updateRequest: UpdateNewsRequest) => {
    const currentNews = await getById(updateRequest?.newsId);
    if (currentNews.length === 0) {
      throw Error("Not found");
    }

    const currentCategories: string[] = currentNews[0].categoryIds || [];
    const newCategories: string[] = updateRequest.categories;

    let deletedCategories = currentCategories.filter(
      (x) => !newCategories.includes(x)
    );
    let insertedCategories = newCategories.filter(
      (x) => !currentCategories.includes(x)
    );

    const updateResult = await updateById(
      updateRequest,
      deletedCategories,
      insertedCategories
    );

    return newsMapper(updateResult, newCategories);
  },
  deleteNews: async (newsId: string): Promise<Boolean> => {
    const currentNews = await getById(newsId);
    if (currentNews.length === 0) {
      throw Error("Not found");
    }

    await deleteById(newsId);
    return true;
  },
};
