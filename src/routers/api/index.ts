import { Hono } from "hono";
import { markRouter } from "./mark";
import { categoryRouter } from "./category";

const apiRouter = new Hono();
export default apiRouter;

apiRouter.route("/mark", markRouter);
apiRouter.route("/category", categoryRouter);
