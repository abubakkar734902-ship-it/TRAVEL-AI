import { Router } from "express";

import { auth } from "../middleware/auth.js";

import {
    destinations,
    alerts
} from "../services/mockData.js";

import {
    copilot
} from "../services/aiService.js";

import {
    calculateRisk
} from "../services/riskService.js";


const router =
    Router();


router.get(
    "/destinations",

    (req, res) => {

        res.json(
            destinations
        );

    }
);


router.get(
    "/alerts",

    (req, res) => {

        res.json(
            alerts
        );

    }
);


router.get(
    "/weather",

    (req, res) => {

        const city =
            req.query.city ||
            "Mysuru";


        res.json({

            city,

            temperature:
                27,

            condition:
                "Partly cloudy",

            rainProbability:
                35,

            source:
                "Demo provider"

        });

    }
);


router.get(
    "/risk",

    (req, res) => {

        const result =
            calculateRisk({

                rainProbability:
                    Number(
                        req.query.rain ||
                        35
                    ),

                crowd:
                    Number(
                        req.query.crowd ||
                        42
                    ),

                roadRisk:
                    Number(
                        req.query.road ||
                        15
                    )

            });


        res.json(
            result
        );

    }
);


router.post(
    "/copilot",

    auth,

    async (req, res) => {

        const answer =
            await copilot(

                req.body.message,

                req.body.context

            );


        res.json({

            answer

        });

    }
);


router.post(
    "/optimize-route",

    auth,

    (req, res) => {

        const places =
            req.body.places ||
            [];


        res.json({

            optimizedOrder:
                [...places].reverse(),

            estimatedSavings:
                "18% travel distance",

            note:
                "Connect Google Maps, Mapbox or OSRM for production routing."

        });

    }
);


router.post(
    "/review-summary",

    auth,

    (req, res) => {

        const reviews =
            req.body.reviews ||
            [];


        res.json({

            rating:
                4.4,

            pros: [

                "Good location",

                "Friendly staff",

                "Clean rooms"

            ],

            cons: [

                "Parking can be limited",

                "Wi-Fi may be slow"

            ],

            reviewCount:
                reviews.length,

            summary:
                "Overall positive experience with a few practical limitations."

        });

    }
);


export default router;