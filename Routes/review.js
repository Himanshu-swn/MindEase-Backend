import express from "express";

import { createReview, getAllReview } from "../Controllers/reviewController.js";

import { authenticate, restrict } from "../auth/verifyToken.js";
//in order to access to doctor id-parents param will pass it to nested route
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(getAllReview)
  .post(authenticate, restrict(["patient"]), createReview);

export default router;
