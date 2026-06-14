import { Hono } from "hono";
import { registerPage } from "@/routers/utils";
import { HomePage } from "@/pages/Home";

const pageRouter = new Hono();
export default pageRouter;

registerPage(pageRouter, "/", HomePage);
