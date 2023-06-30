import { Kysely } from "kysely";
import { v4 } from "uuid";
/**
 * @param db {Kysely<any>}
 */
export const up = async (db) => {
  await db.schema
    .createTable("publishers")
    .addColumn("id", "varchar(50)", (col) => col.primaryKey())
    .addColumn("name", "varchar(50)")
    .addColumn("email", "varchar(50)")
    .execute();

  await db.schema
    .createTable("categories")
    .addColumn("id", "varchar(50)", (col) => col.primaryKey())
    .addColumn("name", "varchar(50)")
    .execute();
    
  await db
    .insertInto("categories")
    .values({
      id: v4(),
      name: "Category 001"
    }, {
      id: v4(),
      name: "Category 002"
    })
    .execute();

  await db.schema
    .createTable("news")
    .addColumn("id", "varchar(50)", (col) => col.primaryKey())
    .addColumn("title", "varchar(50)")
    .addColumn("content", "text")
    .addColumn("publisher_id", "varchar(50)")
    .addColumn("created_date", "timestamp")
    .addColumn("updated_date", "timestamp")
    .execute();
  
  await db.schema
    .createTable("new_category")
    .addColumn("news_id", "varchar(50)", (col) => 
      col.references('news.id'))
    .addColumn("category_id", "varchar(50)", (col) => 
      col.references('categories.id'))
    .execute()

  await db.schema
    .createTable("events")
    .addColumn("id", "varchar(50)", (col) => col.primaryKey())
    .addColumn("news_id", "varchar(50)")
    .addColumn("client", "text")
    .addColumn("last_time", "varchar(50)")
    .execute()
};

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.dropTable("publishers").execute();
}
