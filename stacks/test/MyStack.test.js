import { Template } from "aws-cdk-lib/assertions";
import { initProject } from "sst/project";
import { App, getStack } from "sst/constructs";
import { NewsStack } from "../MyStack";
import { it } from "vitest";

it("Test NewsStack", async () => {
  await initProject({});
  const app = new App({ mode: "deploy" });
  // WHEN
  app.stack(NewsStack);
  // THEN
  const template = Template.fromStack(getStack(NewsStack));
  template.hasResourceProperties("AWS::AppSync::GraphQLApi", {
  })
  template.hasResourceProperties("AWS::AppSync::GraphQLSchema", {})
  template.hasResourceProperties("AWS::AppSync::Resolver", {})
  template.hasResourceProperties("AWS::AppSync::DataSource", {})

  template.hasResourceProperties("AWS::Cognito::UserPool", {})
  template.hasResourceProperties("AWS::Cognito::UserPoolClient", {})

  template.hasResourceProperties("AWS::RDS::DBCluster", {})
});