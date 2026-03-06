import { Router } from "express";
import { authenticateToken } from "../middlewares/tokenValidation";
import { ContactController } from "../controller/contact.controller";
import { validate } from "../middlewares/zodValidate";
import { createContactSchema } from "../schemas/contact.schema";

const contactsRouter: Router = Router();
const contactController = new ContactController();

contactsRouter.use(authenticateToken(["master_admin", "org_admin", "student"]));

contactsRouter.post("/", validate(createContactSchema), contactController.createContact);
contactsRouter.get("/all", contactController.getAllContacts);
contactsRouter.get("/:designation", contactController.getContactsByDesig);

export default contactsRouter;