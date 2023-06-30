import { Kysely } from "kysely";
import { DataApiDialect } from "kysely-data-api";
import { RDS } from "sst/node/rds";
import { RDSData } from "@aws-sdk/client-rds-data";
import {
  CategoriesModel,
  NewCategoryModel,
  NewsModel,
  PublishersModel,
  EventsModel,
} from "../model";

interface Database {
  publishers: PublishersModel;
  news: NewsModel;
  new_category: NewCategoryModel;
  categories: CategoriesModel;
  events: EventsModel;
}

export const db = new Kysely<Database>({
  dialect: new DataApiDialect({
    mode: "postgres",
    driver: {
      database: RDS.Cluster.defaultDatabaseName,
      secretArn: RDS.Cluster.secretArn,
      resourceArn: RDS.Cluster.clusterArn,
      client: new RDSData({}),
    },
  }) as any,
});
