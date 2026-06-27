import { Hono } from "hono";
import { registerPage } from "@/routers/utils";
import { HomePage } from "@/pages/Home";
import { SeriesPage } from "@/pages/Series";

const pageRouter = new Hono();
export default pageRouter;

registerPage(pageRouter, "/", HomePage);
registerPage(pageRouter, "/series", SeriesPage);
