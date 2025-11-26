import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { updateAdmin, updatePassword } from "../controller/admin.controller.js";
const adminRouter = Router();
// adminRouter.use(authMiddleware);
adminRouter.route('/updateAdmin').patch(updateAdmin)
adminRouter.route('/updatePassword').patch(updatePassword)

export {adminRouter}