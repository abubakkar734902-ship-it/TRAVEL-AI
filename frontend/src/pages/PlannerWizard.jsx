import React, { useState } from "react";

const image = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=80`;

const steps = [
    { key: "travelType", title: "How are you planning to travel?", hint: "Choose the travel group that best matches your trip.", items: [["Solo", "photo-1500534623283-312aade485b7"], ["Couple", "photo-1516589178581-6cd7833ae3b2"], ["Family", "photo-1504150558240-0b4fd8946624"], ["With Friends", "photo-1529156069898-49953e39b3ac"]] },
    { key: "duration", title: "Choose the duration of the trip", hint: "Pick a duration that fits your travel style.", items: [["2 - 3 days", "photo-1500534623283-312aade485b7"], ["3 - 5 days", "photo-1527631746610-bca00a040d60"], ["5 - 8 days", "photo-1476514525535-07fb3b4ae5f1"], ["8+ days", "photo-1501785888041-af3ef285b470"]] },
    { key: "month", title: "Choose the month you would like to travel", hint: "Season-aware recommendations improve your plan.", items: [["August", "photo-1470770841072-f978cf4d019e"], ["September", "photo-1470770841072-f978cf4d019e"], ["October", "photo-1500534314209-a25ddb2bd429"], ["November", "photo-1507525428034-b723cf961d3e"], ["December", "photo-1483347756197-71ef80e95f73"], ["January", "photo-1513836279014-a89f7a76ae86"]] },
    { key: "state", title: "Select a region to explore", hint: "Search a state or city.", search: true, items: [["Andhra Pradesh", "photo-1582510003544-4d00b7f74220"], ["Karnataka", "photo-1600100397608-f010cfb7d2e7"], ["Kerala", "photo-1602216056096-3b40cc0c9944"], ["Tamil Nadu", "photo-1470071459604-3b5ec3a7fe05"], ["Goa", "photo-1512343879784-a960bf40e7f2"], ["Himachal Pradesh", "photo-1500534623283-312aade485b7"]] },
    { key: "city", title: "Make your pick on cities", hint: "Choose a city to personalize your activities.", items: [["Alleppey", "photo-1602216056096-3b40cc0c9944"], ["Kochi", "photo-1593693411515-c20261bcad6e"], ["Munnar", "photo-1500534623283-312aade485b7"], ["Thekkady", "photo-1470770841072-f978cf4d019e"], ["Kumarakom", "photo-1602216056096-3b40cc0c9944"], ["Thiruvananthapuram", "photo-1582510003544-4d00b7f74220"]] },
    { key: "activities", title: "What activities would you enjoy?", hint: "Select one or more experiences.", multi: true, items: [["Boat house", "photo-1602216056096-3b40cc0c9944"], ["Beach time", "photo-1507525428034-b723cf961d3e"], ["Candle light dinner", "photo-1516589178581-6cd7833ae3b2"], ["Local food", "photo-1593693411515-c20261bcad6e"]] },
    { key: "accommodation", title: "Your choice of accommodation", hint: "Select the type of stay you prefer.", items: [["Heritage", "photo-1564501049412-61c2a3083791"], ["Comfy", "photo-1566073771259-6a8506099945"], ["Homestay", "photo-1564013799919-ab600027ffc6"], ["Economical", "photo-1551882547-ff40c63fe5fa"], ["Luxury", "photo-1542314831-068cd1dbfeeb"]] }
];

const emptyTrip = { travelType: "", duration: "", month: "", state: "", city: "", activities: [], accommodation: "" };

export default function PlannerWizard() {
    const [step, setStep] = useState(0);
    const [trip, setTrip] = useState(emptyTrip);
    const [search, setSearch] = useState("");
    const [done, setDone] = useState(false);
    const current = steps[step];
    const value = trip[current.key];
    const selected = (item) => current.multi ? value.includes(item) : value === item;
    const pick = (item) => setTrip((old) => ({ ...old, [current.key]: current.multi ? (old[current.key].includes(item) ? old[current.key].filter((x) => x !== item) : [...old[current.key], item]) : item }));
    const valid = current.multi ? value.length > 0 : Boolean(value);
    const reset = () => { setStep(0); setTrip(emptyTrip); setSearch(""); setDone(false); };
    const items = current.items.filter(([name]) => name.toLowerCase().includes(search.toLowerCase()));

    return <section className="wizardPage">
        <div className="wizardHeader"><div><span className="wizardBrand">TRAVELAI PLANNER</span><h1>{done ? `${trip.city || trip.state}, here we come!` : "Build your perfect trip."}</h1><p>{done ? "Your preferences are ready for a personalized itinerary." : "Answer eight quick questions and let your journey take shape."}</p></div><button className="wizardReset" onClick={reset}>Reset</button></div>
        {!done && <div className="wizardProgress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>}
        {done ? <div className="wizardResult"><div className="wizardSummary">{Object.entries(trip).filter(([, item]) => item && (!Array.isArray(item) || item.length)).map(([key, item]) => <div key={key}><small>{key}</small><b>{Array.isArray(item) ? item.join(", ") : item}</b></div>)}</div><h2>Your AI itinerary preview</h2><div className="wizardDays"><p><b>Day 1</b> Arrival, check-in and local sightseeing</p><p><b>Day 2</b> {trip.activities.join(" and ")}</p><p><b>Day 3</b> Culture, food and a scenic experience</p></div><button className="wizardNext" onClick={reset}>Start again</button></div> : <><div className="wizardHeading"><small>STEP {String(step + 1).padStart(2, "0")} OF 08</small><h2>{current.title}</h2><p>{current.hint}</p></div>{current.search && <input className="wizardSearch" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search a state or city..." />}<div className="wizardGrid">{items.map(([name, photo]) => <button className={`wizardOption${selected(name) ? " selected" : ""}`} key={name} onClick={() => pick(name)}><img src={image(photo)} alt="" /><span>{name}</span>{selected(name) && <b>✓</b>}</button>)}</div><div className="wizardFooter"><button disabled={step === 0} onClick={() => setStep(step - 1)}>Previous</button><button className="wizardNext" disabled={!valid} onClick={() => step === steps.length - 1 ? setDone(true) : setStep(step + 1)}>{step === steps.length - 1 ? "Create my trip" : "Next"}</button></div></>}
    </section>;
}
