import express from 'express';
import { config } from '@/config';
import { LogResponses } from '@/api/middleware';
import { checkServerReadiness, registerFacility } from '@/api/handler';
import { errorHandler } from '@/api/errors';


const app = express();


app.use("/", express.static("./src/app"));      // display index.html
app.use(express.json());                        // allows to easily parse requests
app.use(LogResponses);                          // log response if not a 2xx


app.get("/api/v1/healthz", checkServerReadiness);
app.post("/api/v1/facilities", registerFacility);


app.use(errorHandler);                          // needs to go last to resolve errors

app.listen(config.api.port, () => {
    console.log(`Server listening at http://localhost:${config.api.port}`);
});