import { Router } from "express";

import { auth } from "../middleware/auth.js";

import {
    generateItinerary
} from "../services/aiService.js";


const router =
    Router();


router.post(
    "/plan",

    auth,

    async (req, res) => {

        try {

            const itinerary =
                await generateItinerary(
                    req.body
                );


            res.json(
                itinerary
            );


        } catch (error) {

            res.status(500).json({

                error:
                    "Unable to generate itinerary."

            });

        }

    }
);


router.post(
    "/replan",

    auth,

    async (req, res) => {

        const {
            itinerary
        } =
            req.body;


        if (!itinerary) {

            return res.status(400).json({

                error:
                    "Itinerary required."

            });

        }


        const updated = {

            ...itinerary,

            replanned:
                true,

            reason:
                "Heavy rain detected",

            notice:
                "AI dynamically adjusted the itinerary.",

            days:
                itinerary.days.map(
                    (day, index) => ({

                        ...day,

                        afternoon:
                            index === 0

                                ? "Indoor cultural experience"

                                : day.afternoon

                    })
                )

        };


        res.json(
            updated
        );

    }
);


export default router;