import connectToDatabase from "./database/connect";
import createServer from "./server/create";

import config from "./config";

connectToDatabase(config.server.database)
  .then(createServer)
  .catch((e) => {
    throw e;
  });
