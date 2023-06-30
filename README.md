# Papaya Insurtech - Back End Challenge 2

## Description

- I have already deployed my application on AWS, here is the graphql url:
  - authentication endpoint: https://dtcmorhedbguhnvheg5mgx73f4.appsync-api.ap-southeast-1.amazonaws.com/graphql
  - publisher endpoint: https://rm26bdipizdapiymz4upcoimgu.appsync-api.ap-southeast-1.amazonaws.com/graphql
  - guest endpoint: https://rm26bdipizdapiymz4upcoimgu.appsync-api.ap-southeast-1.amazonaws.com/graphql
- I built the application that using AppSync (GraphQL), RDS (PostgreSQL), Lambda function, Cognito (Authentication). The system is fully serverless by using sst which is a framework that makes it easy to build modern full-stack applications on AWS ([What is sst?](https://sst.dev)).
- You can also run it locally by the below guildline.

## Prerequisites

- You'll need at least Node.js 16.
- You need to install AWS CLI [User Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
- You need to have an AWS account and configure AWS credentials locally:

```
    aws configure
```

## Local development

- Install dependencies

```
    yarn
```

- Start API local:

```
    yarn sst dev --stage local
```

## Structures

- stacks: contains the app's infrastructure as defined as code (Iac).
- packages:
  - packages/core: contains some common functions.
  - packages/functions: contains logic codes.
- services/migrations: contains migration files of database.

## Requirement checklist

- Unauthenticated requests:
  - [x] List of news (search, filter, pagination)
  - [x] List of category
  - [x] List of publisher
  - [x] Detail of a news
- Publisher Authenticated request:
  - [x] List of their news
  - [x] Create news
  - [x] Update news
  - [x] Delete news
- Webhook (Optional):
  - [x] Every time news is read by someone, the system will callback to a pre-registered endpoint of the Publisher to notify them.

## Technical checklist

- [x] The API system should be written in TypeScript with Strict Mode (you can pick any framework of your choice)
- [x] Should use GraphQL with DataLoader pattern
- [x] Unit tests should be written and green
