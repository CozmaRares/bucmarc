import { Hono } from "hono";
import { getMarks, saveMark } from "@/db";

const apiRouter = new Hono();
export default apiRouter;

apiRouter.get("/mark/save/:url", async c => {
    const url = decodeUrl(c.req.param());
    await saveMark(url);
    return c.redirect(url, 302);
});

apiRouter.get("/mark/list", async c => {
    const marks = await getMarks();
    return c.json(marks);
});

// apiRouter.delete("/delete/:url", async c => {
//     const url = decodeUrl(c.req.param());
//     await deleteMark(url);
//     return c.json({ success: true });
// });

function decodeUrl(params: { url: string }) {
    const url = params.url;
    const decodedURL = decodeURIComponent(url);
    return decodedURL;
}
