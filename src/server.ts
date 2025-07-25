import express from 'express';
import { config } from '@/config';
import { LogResponses } from '@/api/middleware/logger';
import { errorHandler } from '@/api/errors';
import v1Routes from './api/router/v1.routes';


const app = express();

app.use("/", express.static("./src/app"));      // display index.html
app.use(express.json());                        // allows to easily parse requests
app.use("/api/v1", v1Routes);                   // set v1 api routes
app.use(LogResponses);                          // log response if not a 2xx
app.use(errorHandler);                          // needs to go last to resolve errors

app.listen(config.api.port, () => {
    console.log(`Server listening at http://localhost:${config.api.port}`);
});