import { getConfig } from "../config";
import { getHandler } from "./viewer-response";

const config = getConfig();

export const handler = getHandler(config);
