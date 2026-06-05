import { HomePage } from "@/pages/Home";
import { SharePage } from "@/pages/Share";
import type { Page } from "./types";

export const pageRegistry = [
    HomePage,
    SharePage,
] as const satisfies Page<any>[];
