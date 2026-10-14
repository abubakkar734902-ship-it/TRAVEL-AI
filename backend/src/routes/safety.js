import { Router } from "express";

import { auth } from "../middleware/auth.js";


const router =
    Router();


router.get(
    "/nearby",

    auth,

    (req, res) => {

        res.json({

            hospitals: [

                {
                    name:
                        "City Care Hospital",

                    distanceKm:
                        2.1
                }

            ],

            police: [

                {
                    name:
                        "Central Police Station",

                    distanceKm:
                        1.7
                }

            ],

            emergencyNumber:
                "112"

        });

    }
);


router.post(
    "/sos",

    auth,

    (req, res) => {

        const {
            latitude,
            longitude
        } =
            req.body;


        res.json({

            success:
                true,

            status:
                "SOS_TRIGGERED",

            location: {

                latitude,

                longitude

            },

            message:
                "SOS request received. Production version should notify trusted contacts and emergency services."

        });

    }
);


export default router;