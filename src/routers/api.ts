import { Hono } from "hono";
import { deleteMark, getMarks, saveMark } from "@/db";

const apiRouter = new Hono();
export default apiRouter;

apiRouter.get("/mark/save/:url", async c => {
    const url = decodeUrl(c.req.param("url"));
    await saveMark(url);
    return c.redirect(url, 302);
});

apiRouter.get("/mark/list", async c => {
    const marks = await getMarks();
    return c.json(marks);
});

apiRouter.delete("/mark/delete/:url", async c => {
    const url = decodeUrl(c.req.param("url"));
    await deleteMark(url);
    return c.json({ success: true });
});

function decodeUrl(url: string) {
    return decodeURIComponent(url);
}
