import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import Share from "@/pages/Share";
import { pageRegistry } from "@/pages";
import { getCategoryByShareToken, getMarksByCategoryId } from "@/db";

const pageRouter = new Hono();
export default pageRouter;

pageRouter.get(
    "/*",
    jsxRenderer(({ children }) => (
        <html>
            <body>{children}</body>
        </html>
    )),
);

pageRouter.get("/share/:token", async c => {
    const token = c.req.param("token");
    const [category] = await getCategoryByShareToken(token);

    if (!category) {
        return c.text("Not Found", 404);
    }

    const marks = await getMarksByCategoryId(category.id);
    return c.render(
        <Share
            category={category}
            marks={marks}
        />,
    );
});

for (const { path, Component } of pageRegistry) {
    pageRouter.get(path, async c => c.render(<Component />));
}
