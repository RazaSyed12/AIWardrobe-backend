import { fileURLToPath } from "url";
import path from "path";

export const getDirname = (metaUrl) => {
  const __filename = fileURLToPath(metaUrl);
  const __dirname = path.dirname(__filename);
  return __dirname;
};
