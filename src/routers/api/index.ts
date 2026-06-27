import { Hono } from "hono";
import { markRouter } from "./mark";
import { categoryRouter } from "./category";
import { seriesRouter } from "./series";

const apiRouter = new Hono();
export default apiRouter;

apiRouter.route("/mark", markRouter);
apiRouter.route("/category", categoryRouter);
apiRouter.route("/series", seriesRouter);
