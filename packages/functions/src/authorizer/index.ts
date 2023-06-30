import * as cognitoService from "@news-app/core/aws/cognito";

export async function handler(event: any) {
  const accessToken = event?.authorizationToken;
  let userAttrs;

  try {
    const user = await cognitoService.getUser(accessToken);
    userAttrs = user.UserAttributes;
  } catch (error: any) {
    const response = {
      isAuthorized: false,
    };
    return response;
  }

  const cognitoCustomIdObj = userAttrs?.find(
    (attr) => attr.Name === "custom:id"
  );
  const cognitoCustomTenantId = cognitoCustomIdObj?.Value;

  const response = {
    isAuthorized: true,
    resolverContext: {
      id: cognitoCustomTenantId,
    },
  };

  return response;
}
