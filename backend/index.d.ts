import { AccessTokenPayload } from "./src/utils/jwt.ts";

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}
