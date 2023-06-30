import { AuthorizationType, MappingTemplate } from "aws-cdk-lib/aws-appsync";
import { StringAttribute } from "aws-cdk-lib/aws-cognito";
import {
  StackContext,
  AppSyncApi,
  Cognito,
  Config,
  RDS,
  Function,
} from "sst/constructs";

export function NewsStack({ app, stack }: StackContext) {
  // create cognito
  const userPool = new Cognito(stack, "publisher-user-pool", {
    login: ["email"],
    cdk: {
      userPool: {
        customAttributes: {
          id: new StringAttribute({ mutable: false }),
          name: new StringAttribute({ mutable: true }),
        },
      },
      userPoolClient: {
        authFlows: {
          adminUserPassword: true,
          userPassword: true,
        },
      },
    },
  });

  const userPoolId = new Config.Parameter(stack, "publisher-user-pool-id", {
    value: userPool.userPoolId,
  });

  const userPoolClientId = new Config.Parameter(
    stack,
    "publisher-user-pool-client-id",
    {
      value: userPool.userPoolClientId,
    }
  );

  // create the Aurora DB cluster
  const cluster = new RDS(stack, "Cluster", {
    engine: "postgresql11.13",
    defaultDatabaseName: "NewsApplication",
    migrations: "services/migrations",
  });

  // authorizer
  const authorizerFunc = new Function(stack, "authorizer", {
    handler: "packages/functions/src/authorizer/index.handler",
  });

  // create graphql
  const authGraphql = new AppSyncApi(stack, "auth-graphql", {
    schema: "packages/functions/src/schema/index.graphql",
    dataSources: {
      auth: "packages/functions/src/resolvers/auth.handler",
    },
    defaults: {
      function: {
        bind: [userPoolId, userPoolClientId, cluster],
      },
    },
    resolvers: {
      "Mutation signUp": "auth",
      "Mutation signIn": "auth",
    },
  });

  authGraphql.attachPermissionsToDataSource("auth", [
    "cognito-idp:AdminCreateUser",
    "cognito-idp:AdminSetUserPassword",
    "cognito-idp:AdminInitiateAuth",
  ]);

  const publisherGraphql = new AppSyncApi(stack, "publisher-graphql", {
    schema: "packages/functions/src/schema/publisher.graphql",
    dataSources: {
      //publisher: "packages/functions/src/resolvers/publisher.handler",
      news: "packages/functions/src/resolvers/news.handler",
    },
    defaults: {
      function: {
        bind: [cluster],
      },
    },
    resolvers: {
      "Mutation createNews": "news",
      "Mutation updateNews": "news",
      "Mutation deleteNews": "news",
      "Query getNews": "news",
      "Query getNewsDetails": "news",
    },
    cdk: {
      graphqlApi: {
        authorizationConfig: {
          defaultAuthorization: {
            authorizationType: AuthorizationType.LAMBDA,
            lambdaAuthorizerConfig: {
              handler: authorizerFunc,
            },
          },
        },
      },
    },
  });

  const guestGraphql = new AppSyncApi(stack, "guest-graphql", {
    schema: "packages/functions/src/schema/guest.graphql",
    dataSources: {
      publisher: "packages/functions/src/resolvers/publisher.handler",
      news: "packages/functions/src/resolvers/news.handler",
      batch_news: "packages/functions/src/resolvers/batch_news.handler",
      category: "packages/functions/src/resolvers/category.handler",
      batch_categories:
        "packages/functions/src/resolvers/batch_categories.handler",
    },
    defaults: {
      function: {
        bind: [cluster],
      },
    },
    resolvers: {
      "Query getAllNews": "news",
      "News relatedNews": {
        dataSource: "batch_news",
        requestMapping: {
          inline: `{
            "version": "2017-02-28",
            "operation": "BatchInvoke",
            "payload": {
              "field": "relatedNews",
              "source": $utils.toJson($context.source)
            }
          }`,
        },
      },
      "News categories": {
        dataSource: "batch_categories",
        requestMapping: {
          inline: `{
            "version": "2017-02-28",
            "operation": "BatchInvoke",
            "payload": {
              "field": "categories",
              "source": $utils.toJson($context.source)
            }
          }`,
        },
      },
      "Query getAllCategories": "category",
      "Query getAllPublishers": "publisher",
      "Query getNewsDetails": "news",
      "Mutation receiveNewRead": "publisher",
      "Subscription notifyReadNews": "publisher",
    },
  });

  stack.addOutputs({
    AuthGraphql: authGraphql.url,
    PublisherGraphql: publisherGraphql.url,
    GuestGraphql: guestGraphql.url,
    SecretArn: cluster.secretArn,
    ClusterIdentifier: cluster.clusterIdentifier,
  });
}
