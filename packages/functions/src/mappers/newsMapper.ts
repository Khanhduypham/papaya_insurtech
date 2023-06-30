import { NewsModel } from "@news-app/core/model";
import { News } from "src/domains";

export const newsMapper = (model: NewsModel, categories: string[]) => {
  return {
    id: model.id,
    title: model.title,
    content: model.content,
    publisherId: model.publisher_id,
    createdDate: model.created_date,
    updatedDate: model.updated_date,
    categories: categories,
  };
};
