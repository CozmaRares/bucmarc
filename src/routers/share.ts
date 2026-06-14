import { registerPage } from "@/routers/utils";
import { SharePage } from "@/pages/Share";
import { Hono } from "hono";

const shareRouter = new Hono();
export default shareRouter;

registerPage(shareRouter, "/:token", SharePage);
