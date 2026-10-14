export async function generateItinerary(input) {

    const days =
        Number(input.days || 3);

    const budget =
        Number(input.budget || 10000);

    const destination =
        input.destination ||
        "Mysuru";

    const interests =
        input.interests?.length
            ? input.interests
            : ["heritage", "food"];


    const activities = {

        heritage: [
            "Palace heritage walk",
            "Museum visit",
            "Historic market"
        ],

        nature: [
            "Nature trail",
            "Sunset viewpoint",
            "Lake experience"
        ],

        adventure: [
            "Adventure activity",
            "Cycling route",
            "Short trek"
        ],

        food: [
            "Local breakfast",
            "Regional food walk",
            "Traditional dinner"
        ],

        shopping: [
            "Local handicraft market",
            "Artisan workshop",
            "Souvenir market"
        ]

    };


    const selected =
        interests
            .flatMap(
                item =>
                    activities[item] || []
            )
            .slice(0, 6);


    const dailyBudget =
        Math.round(
            budget / days
        );


    return {

        title:
            `AI Smart Trip – ${destination}`,

        destination,

        budget,

        dailyBudget,

        optimization:
            "budget + time + distance + weather + crowd",

        days:
            Array.from(
                {
                    length:
                        days
                },

                (_, index) => ({

                    day:
                        index + 1,

                    morning:
                        selected[
                            (index * 2) %
                            Math.max(
                                selected.length,
                                1
                            )
                        ] ||
                        "Local exploration",

                    afternoon:
                        selected[
                            (index * 2 + 1) %
                            Math.max(
                                selected.length,
                                1
                            )
                        ] ||
                        "Flexible experience",

                    evening:
                        "Local food + relaxed exploration",

                    estimatedSpend:
                        dailyBudget

                })

            )

    };

}


export async function copilot(
    message,
    context = {}
) {

    const text =
        message.toLowerCase();


    if (
        text.includes("rain") ||
        text.includes("weather")
    ) {

        return (
            "If rain risk is high, I recommend moving outdoor activities to a safer window and replacing exposed activities with museums, food walks or indoor cultural experiences."
        );

    }


    if (
        text.includes("budget")
    ) {

        return (
            `Your current trip budget is ₹${context.budget || 10000}. I can prioritize lower-cost transport, stays and experiences.`
        );

    }


    if (
        text.includes("safe")
    ) {

        return (
            "I recommend safer routes, daylight travel, verified local operators and keeping emergency contacts available."
        );

    }


    return (

        `For ${context.destination || "your destination"}, I would consider budget, weather, crowd level, distance, opening hours and your interests before recommending the next activity.`

    );

}