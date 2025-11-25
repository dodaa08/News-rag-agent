import express from "express";
const app = express();
import NewsRouter from "./routes/fetchNews/route.js";
app.use(express.json());
app.use('/api/news', NewsRouter);
const port = 8080;
app.get("/", (req, res) => {
    res.send("Hello world!");
});
app.listen(port, () => {
    console.log("Running on", port);
});
//# sourceMappingURL=index.js.map