import { db } from "@news-app/core/index";
import { CategoriesModel } from "@news-app/core/model";

export const getAllCategories = async () => {
  return await db.selectFrom("categories").selectAll().execute();
};

export const getCategoriesByNewsId = async (
  newsId: string
): Promise<CategoriesModel> => {
  return (await db
    .selectFrom("categories")
    .innerJoin("new_category", "categories.id", "new_category.category_id")
    .where("new_category.news_id", "=", newsId)
    .select(["categories.id", "categories.name"])
    .execute()) as any;
};
