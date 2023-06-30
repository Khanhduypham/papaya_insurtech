import { SSTConfig } from "sst";
import { NewsStack } from "./stacks/MyStack";

export default {
  config(_input) {
    return {
      name: "news-app",
      region: "ap-southeast-1",
    };
  },
  stacks(app) {
    app.stack(NewsStack);
  },
} satisfies SSTConfig;
