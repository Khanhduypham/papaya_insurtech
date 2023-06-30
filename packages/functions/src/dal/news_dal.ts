import { db } from "@news-app/core/index";
import { NewsModel } from "@news-app/core/model";
import { InsertResult } from "kysely";
import { sql } from "kysely";
import {
  createNewsRequest,
  Filter,
  GetAllNewsRequest,
  News,
  UpdateNewsRequest,
} from "src/domains";
import { newsMapper } from "../mappers";
import { v4 } from "uuid";

export const create = async (
  publisherId: string,
  createRequest: createNewsRequest
): Promise<News> => {
  const payload: NewsModel = {
    id: v4(),
    title: createRequest.title,
    content: createRequest.content,
    publisher_id: publisherId,
    created_date: new Date(),
    updated_date: new Date(),
  };

  const promise: Promise<InsertResult>[] = [];

  await db.transaction().execute(async (trx) => {
    trx.insertInto("news").values(payload).executeTakeFirst();
    createRequest.categories.forEach((id: any) => {
      promise.push(
        trx
          .insertInto("new_category")
          .values({
            category_id: id,
            news_id: payload.id,
          })
          .executeTakeFirst()
      );
    });
    await Promise.all(promise);
  });
  return newsMapper(payload, createRequest.categories);
};

export const getByPublisherId = async (
  publisherId: string
): Promise<News[]> => {
  return (await db
    .selectFrom("news")
    .innerJoin("new_category", "new_category.news_id", "news.id")
    .innerJoin("categories", "categories.id", "new_category.category_id")
    .select(
      ({ fn }) =>
        [
          "news.id",
          "news.title",
          fn.agg<string[]>("array_agg", ["categories.name"]).as("categories"),
        ] as any
    )
    .groupBy("news.id")
    .where("publisher_id", "=", publisherId)
    .execute()) as any;
};

export const getById = async (newsId: string): Promise<News[]> => {
  return (await db
    .selectFrom("news")
    .innerJoin("new_category", "new_category.news_id", "news.id")
    .innerJoin("categories", "categories.id", "new_category.category_id")
    .select(
      ({ fn }) =>
        [
          "news.id",
          "news.title",
          "news.content",
          "news.created_date as createdDate",
          "news.updated_date as updatedDate",
          fn
            .agg<string[]>("array_agg", ["categories.name"])
            .as("categoryNames"),
          fn.agg<string[]>("array_agg", ["categories.id"]).as("categoryIds"),
        ] as any
    )
    .groupBy("news.id")
    .where("news.id", "=", newsId)
    .execute()) as any;
};

export const getAll = async (
  getRequest: GetAllNewsRequest
): Promise<News[]> => {
  const limit = getRequest?.limit || 5;
  const offset = getRequest?.offset || 0;
  let query = db
    .selectFrom("news")
    .innerJoin("new_category", "new_category.news_id", "news.id")
    .innerJoin("categories", "categories.id", "new_category.category_id")
    .innerJoin("publishers", "news.publisher_id", "publishers.id")
    .select(({ fn }) => [
      "news.id",
      "news.title",
      "news.content",
      "news.publisher_id as publisherId",
      "news.created_date as createdDate",
      "news.updated_date as updatedDate",
      "publishers.name",
    ])
    .groupBy(sql`news.id, publishers.name`);

  if (getRequest?.search) {
    query = query.where("news.title", "like", `%${getRequest.search}%`);
  }

  if (getRequest?.filters && getRequest.filters.length > 0) {
    let havingQuery = "";
    getRequest.filters.forEach((e: Filter) => {
      if (e.name === "category") {
        e.values.forEach((value: string) => {
          havingQuery === ""
            ? (havingQuery = `'${value}' = ANY(ARRAY_AGG(DISTINCT categories.name))`)
            : (havingQuery += ` or '${value}' = ANY(ARRAY_AGG(DISTINCT categories.name))`);
        });
      }
      if (e.name === "publisher") {
        e.values.forEach((value: string) => {
          query = query.where("publishers.name", "like", `%${value}%`);
        });
      }
    });

    query = query.having(sql` ${sql.raw(havingQuery)} `);
  }

  return (await query
    .limit(limit)
    .offset(offset)
    .orderBy("news.created_date")
    .execute()) as any;
};

export const getRelatedByPublisherId = async (
  newsId: string,
  publisherId: string
): Promise<News[]> => {
  return (await db
    .selectFrom("news")
    .innerJoin("publishers", "news.publisher_id", "publishers.id")
    .where("news.id", "!=", newsId)
    .where("publishers.id", "=", publisherId)
    .select(() => [
      "news.id",
      "news.title",
      "news.created_date as createdDate",
      "news.content",
      "news.publisher_id as publisherId",
      "publishers.name",
    ])
    .limit(3)
    .execute()) as any;
};

export const updateById = async (
  updateRequest: UpdateNewsRequest,
  deletedCategories: String[] = [],
  insertedCategories: String[] = []
) => {
  const result = await db.transaction().execute(async (trx) => {
    const promises: any = [];
    deletedCategories.forEach((id: any) => {
      promises.push(
        trx
          .deleteFrom("new_category")
          .where("category_id", "=", id)
          .where("news_id", "=", updateRequest.newsId)
          .executeTakeFirstOrThrow()
      );
    });
    insertedCategories.forEach((id: any) => {
      promises.push(
        trx
          .insertInto("new_category")
          .values({
            news_id: updateRequest.newsId,
            category_id: id,
          })
          .executeTakeFirstOrThrow()
      );
    });
    await Promise.all(promises);
    return await trx
      .updateTable("news")
      .set({
        title: updateRequest.title,
        content: updateRequest.content,
        updated_date: new Date(),
      })
      .where("id", "=", updateRequest.newsId)
      .returningAll()
      .executeTakeFirst();
  });
  if (!result) {
    throw new Error(`Failed to update news with id ${updateRequest.newsId}`);
  }
  return result;
};

export const deleteById = async (newsId: string) => {
  return await db.transaction().execute(async (trx) => {
    const promises: any = [];
    promises.push(
      trx
        .deleteFrom("new_category")
        .where("news_id", "=", newsId)
        .executeTakeFirstOrThrow()
    );

    promises.push(
      trx.deleteFrom("news").where("id", "=", newsId).executeTakeFirstOrThrow()
    );

    await Promise.all(promises);
  });
};
