import express from 'express';
import { config } from './config.js';
import { LogResponses } from './api/middleware.js';
import { checkServerReadiness } from './api/handler.js';


const app = express();


app.use("/", express.static("./src/app"));   // display index.html
app.use(express.json());                        // allows to easily parse requests
app.use(LogResponses);                           // log response if not a 2xx


app.get("/api/v1/healthz", checkServerReadiness); // <-- HERE IS THE ERROR 


app.listen(config.api.port, () => {
    console.log(`Server listening at http://localhost:${config.api.port}`);
});