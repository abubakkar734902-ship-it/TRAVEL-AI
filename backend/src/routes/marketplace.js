import { Router } from "express";

import {
    experiences
} from "../services/mockData.js";


const router =
    Router();


router.get(
    "/experiences",

    (req, res) => {

        res.json(
            experiences
        );

    }
);


router.post(
    "/booking",

    (req, res) => {

        res.json({

            success:
                true,

            bookingId:
                "EXP-" +
                Date.now(),

            experienceId:
                req.body.experienceId,

            status:
                "CONFIRMED"

        });

    }
);


export default router;