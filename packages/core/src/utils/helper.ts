export const jwtToObject = (token: any) => {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
};
