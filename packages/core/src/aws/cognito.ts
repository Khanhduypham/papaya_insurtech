import * as aws from "aws-sdk";

let COGNITO_USER_POOL_ID: string;
let COGNITO_USER_POOL_CLIENT_ID: string;

const AWS_DEFAULT_REGION = process.env.AWS_REGION;

const cognitoIdentityServiceProvider = new aws.CognitoIdentityServiceProvider({
  apiVersion: "2016-04-18",
  region: AWS_DEFAULT_REGION,
});
export const init = (userPoolId: string, userPoolClientId: string) => {
  COGNITO_USER_POOL_ID = userPoolId;
  COGNITO_USER_POOL_CLIENT_ID = userPoolClientId;
};

export const signUp = async (params: any) => {
  const user = await cognitoIdentityServiceProvider
    .adminCreateUser({
      UserPoolId: COGNITO_USER_POOL_ID,
      Username: params.Username,
      TemporaryPassword: params.Password,
      UserAttributes: params.UserAttributes,
    })
    .promise();

  await cognitoIdentityServiceProvider
    .adminSetUserPassword({
      UserPoolId: COGNITO_USER_POOL_ID,
      Username: params.Username,
      Password: params.Password,
      Permanent: true,
    })
    .promise();
  return user;
};

export const signIn = async (params: any) =>
  cognitoIdentityServiceProvider
    .adminInitiateAuth({
      AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
      UserPoolId: COGNITO_USER_POOL_ID,
      ClientId: COGNITO_USER_POOL_CLIENT_ID,
      AuthParameters: params,
    })
    .promise();

export const getUser = async (accessToken: string) => {
  return await cognitoIdentityServiceProvider
    .getUser({ AccessToken: accessToken })
    .promise();
};

export const refreshToken = (refreshToken: string) =>
  cognitoIdentityServiceProvider
    .adminInitiateAuth({
      AuthFlow: "REFRESH_TOKEN_AUTH",
      UserPoolId: COGNITO_USER_POOL_ID,
      ClientId: COGNITO_USER_POOL_CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    })
    .promise();
