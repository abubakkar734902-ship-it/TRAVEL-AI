export function calculateRisk({

    rainProbability = 20,

    crowd = 35,

    roadRisk = 10

}) {

    const score =
        Math.min(

            100,

            Math.round(

                rainProbability * 0.45 +

                crowd * 0.25 +

                roadRisk * 0.30

            )

        );


    let level =
        "LOW";


    if (score >= 70) {

        level =
            "HIGH";

    } else if (score >= 40) {

        level =
            "MEDIUM";

    }


    return {

        score,

        level,

        factors: {

            rainProbability,

            crowd,

            roadRisk

        },

        recommendation:

            level === "HIGH"

                ? "Prefer indoor activities and safer routes."

                : level === "MEDIUM"

                ? "Keep flexible timings and check live alerts."

                : "Outdoor activities are generally suitable."

    };

}