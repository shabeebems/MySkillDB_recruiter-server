import express from "express";
import { LocationController } from "../controller/location.controller";
import { validate } from "../middlewares/zodValidate";
import { countrySchema, stateSchema, districtSchema } from "../schemas/location.schema";
import { authenticateToken } from "../middlewares/tokenValidation";

const router = express.Router();
const locationController = new LocationController();

router.use(authenticateToken(["master_admin"]));

// Country
router.post("/countries", validate(countrySchema), locationController.createCountry);
router.get("/countries", locationController.getAllCountries);
router.put("/countries/:id", locationController.updateCountry);
router.delete("/countries/:id", locationController.deleteCountry);

// State
router.post("/states", validate(stateSchema), locationController.createState);
router.get("/states/:countryCode", locationController.getStatesByCountryCode);
router.put("/states/:id", locationController.updateState);
router.delete("/states/:id", locationController.deleteState);

// District
router.post("/districts", validate(districtSchema), locationController.createDistrict);
router.get("/districts/state/:stateCode", locationController.getDistrictsByStateCode);
router.get("/districts/country/:countryCode", locationController.getDistrictsByCountryCode);
router.put("/districts/:id", locationController.updateDistrict);
router.delete("/districts/:id", locationController.deleteDistrict);

export default router;
