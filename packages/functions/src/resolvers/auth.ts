import { Config } from "sst/node/config";
import { init, signUp, db, signIn, jwtToObject } from "@news-app/core/index";
import { v4 } from "uuid";
import {
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse,
} from "src/domains";
import { createPublisher } from "src/dal";

type AppSyncEvent = {
  info: {
    fieldName: string;
  };
  arguments: {
    signUpRequest: SignUpRequest;
    signInRequest: SignInRequest;
  };
  identity: {
    resolverContext: {
      storeId: string;
    };
  };
};

export async function handler(event: AppSyncEvent) {
  init(
    Config["publisher-user-pool-id"],
    Config["publisher-user-pool-client-id"]
  );

  switch (event.info.fieldName) {
    case "signUp":
      return await AuthFns.signUp(event.arguments.signUpRequest);
    case "signIn":
      return await AuthFns.signIn(event.arguments.signInRequest);
    default:
      return null;
  }
}

const AuthFns = {
  signUp: async (signUpRequest: SignUpRequest): Promise<SignUpResponse> => {
    const payload = {
      id: v4(),
      name: signUpRequest.name,
      email: signUpRequest.email,
    };

    await signUp({
      Username: signUpRequest.email,
      Password: signUpRequest.password,
      UserAttributes: [
        {
          Name: "name",
          Value: payload.name,
        },
        {
          Name: "custom:id",
          Value: payload.id,
        },
      ],
    });

    await createPublisher(payload);
    return payload;
  },
  signIn: async (signInRequest: SignInRequest): Promise<SignInResponse> => {
    const loginResponse = await signIn({
      USERNAME: signInRequest.email,
      PASSWORD: signInRequest.password,
    });
    const objFromToken = jwtToObject(
      loginResponse?.AuthenticationResult?.IdToken
    );

    return {
      accessToken: loginResponse?.AuthenticationResult?.AccessToken || "",
      refreshToken: loginResponse?.AuthenticationResult?.RefreshToken || "",
      id: objFromToken["custom:id"],
    };
  },
};
