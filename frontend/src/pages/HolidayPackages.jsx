import { useMemo, useState } from "react";
import { CarFront, ChevronDown, Clock3, Grid2X2, Heart, Hotel, IndianRupee, MapPinned, MessageCircle, Phone, Plane, Search, Star, Users, X } from "lucide-react";

const image = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=85`;
const packages = [
  { name: "Most Wanted - South India Trip", label: "Deal of the day", category: "ALL PACKAGES", theme: "Nature", city: "Mysore", nights: 5, flights: true, hotel: "4 Star", duration: "5N/6D", price: 16499, oldPrice: 22999, rating: "4.6", image: "photo-1500534623283-312aade485b7" },
  { name: "Peaceful Ooty Honeymoon", label: "Best Seller", category: "HONEYMOON", theme: "Romance", city: "Ooty", nights: 3, flights: false, hotel: "4 Star", duration: "3N/4D", price: 12999, oldPrice: 17999, rating: "4.5", image: "photo-1470770841072-f978cf4d019e" },
  { name: "Kerala Backwater Escape", label: "Popular", category: "MONSOON FREEBIES", theme: "Nature", city: "Kerala", nights: 4, flights: true, hotel: "5 Star", duration: "4N/5D", price: 14999, oldPrice: 19999, rating: "4.7", image: "photo-1602216056096-3b40cc0c9944" },
  { name: "Coorg Nature Retreat", label: "Trending", category: "ALL PACKAGES", theme: "Adventure", city: "Coorg", nights: 3, flights: false, hotel: "3 Star", duration: "3N/4D", price: 10999, oldPrice: 14999, rating: "4.5", image: "photo-1500534314209-a25ddb2bd429" },
  { name: "Sacred Temples of Tamil Nadu", label: "Pilgrim pick", category: "PILGRIMAGE", theme: "Culture", city: "Madurai", nights: 4, flights: false, hotel: "3 Star", duration: "4N/5D", price: 11999, oldPrice: 15999, rating: "4.4", image: "photo-1609766857041-ed402ea8069a" },
];
const hotels = [
  { name: "The Leela Palace", city: "Bengaluru", type: "Luxury stay", price: 6800, rating: "4.8", image: "photo-1564501049412-61c2a3083791" },
  { name: "Ooty Fern Hill", city: "Ooty", type: "Mountain resort", price: 4200, rating: "4.6", image: "photo-1566073771259-6a8506099945" },
  { name: "Kumarakom Lake Resort", city: "Kerala", type: "Backwater stay", price: 5900, rating: "4.7", image: "photo-1542314831-068cd1dbfeeb" },
];
const vehicles = [
  { name: "Toyota Innova Crysta", detail: "6 seats · Driver included", price: 3200, image: "photo-1549317661-bd32c8ce0db2" },
  { name: "Sedan Comfort", detail: "4 seats · Unlimited km", price: 2100, image: "photo-1552519507-da3b142c6e3d" },
  { name: "Royal Enfield Classic", detail: "1 seat · Helmet included", price: 950, image: "photo-1558981806-ec527fa84c39" },
];
const destinations = { Mysore: { lat: 12.2958, lon: 76.6394 }, Ooty: { lat: 11.4064, lon: 76.6932 }, Kerala: { lat: 9.4981, lon: 76.3388 }, Coorg: { lat: 12.3375, lon: 75.8069 }, Madurai: { lat: 9.9252, lon: 78.1198 } };

function PackageCard({ item, favorite, onFavorite, onDetails }) {
  return <article className="packageCard">
    <div className="moreOptions">2 More Options Available</div>
    <div className="packagePhoto"><img src={image(item.image)} alt={item.name} /><span className="packageTag">{item.label}</span><button className={`heartButton ${favorite ? "liked" : ""}`} aria-label={`${favorite ? "Remove" : "Add"} ${item.name} ${favorite ? "from" : "to"} favorites`} onClick={onFavorite}><Heart /></button></div>
    <div className="packageBody"><h3>{item.name}</h3><div className="packageMeta"><span><Clock3 /> {item.duration}</span><span>🍽 Meals</span><span>🚗 Transfers</span><span><Hotel /> Hotels</span></div><div className="packagePrice"><div><strong>₹{item.price.toLocaleString("en-IN")}</strong> <del>₹{item.oldPrice.toLocaleString("en-IN")}</del> <small>per person</small></div><span>{item.rating} <Star /></span></div><button className="detailsButton" onClick={onDetails}>View Details</button></div>
  </article>;
}

function Filters({ filters, onChange, onClear }) {
  const [open, setOpen] = useState(-1);
  const names = ["Duration (in Nights)", "Flights", "Budget (per person)", "Hotel Category", "Cities", "Themes"];
  const options = [["1-3 nights", "short"], ["4-5 nights", "medium"], ["6+ nights", "long"]];
  return <aside className="packageFilters"><h3>FILTERS</h3>{names.map((name, index) => <div className="packageFilter" key={name}><button onClick={() => setOpen(open === index ? -1 : index)}><span>{name}</span><ChevronDown className={open === index ? "rotated" : ""} /></button>{open === index && <div className="filterOptions">{index === 0 && options.map(([label, value]) => <label key={value}><input type="checkbox" checked={filters.duration.includes(value)} onChange={() => onChange("duration", value)} /> {label}</label>)}{index === 1 && <label><input type="checkbox" checked={filters.flights} onChange={() => onChange("flights", !filters.flights)} /> Include flights</label>}{index === 2 && <label><input type="range" min="10000" max="20000" step="1000" value={filters.budget} onChange={(event) => onChange("budget", Number(event.target.value))} /> Up to ₹{filters.budget.toLocaleString("en-IN")}</label>}{index === 3 && ["3 Star", "4 Star", "5 Star"].map((value) => <label key={value}><input type="checkbox" checked={filters.hotel.includes(value)} onChange={() => onChange("hotel", value)} /> {value}</label>)}{index === 4 && ["Mysore", "Ooty", "Kerala", "Coorg", "Madurai"].map((value) => <label key={value}><input type="checkbox" checked={filters.city.includes(value)} onChange={() => onChange("city", value)} /> {value}</label>)}{index === 5 && ["Nature", "Romance", "Adventure", "Culture"].map((value) => <label key={value}><input type="checkbox" checked={filters.theme.includes(value)} onChange={() => onChange("theme", value)} /> {value}</label>)}</div>}</div>)}<button className="clearFilters" onClick={onClear}>Clear All</button></aside>;
}

export default function HolidayPackages() {
  const [tab, setTab] = useState("ALL PACKAGES");
  const [query, setQuery] = useState("");
  const [startingFrom, setStartingFrom] = useState("New Delhi");
  const [goingTo, setGoingTo] = useState("South India");
  const [startingDate, setStartingDate] = useState("");
  const [searched, setSearched] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [sort, setSort] = useState("popular");
  const [selected, setSelected] = useState(null);
  const [serviceTab, setServiceTab] = useState("hotels");
  const [serviceMessage, setServiceMessage] = useState("");
  const [destination, setDestination] = useState("Mysore");
  const [filters, setFilters] = useState({ duration: [], flights: false, budget: 20000, hotel: [], city: [], theme: [] });
  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: Array.isArray(current[key]) ? current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value] : value }));
  const clearFilters = () => setFilters({ duration: [], flights: false, budget: 20000, hotel: [], city: [], theme: [] });
  const visiblePackages = useMemo(() => {
    const result = packages.filter((item) => {
      const durationMatch = !filters.duration.length || filters.duration.some((value) => value === "short" && item.nights <= 3 || value === "medium" && item.nights >= 4 && item.nights <= 5 || value === "long" && item.nights >= 6);
      return item.name.toLowerCase().includes(query.toLowerCase()) && (tab === "ALL PACKAGES" || item.category === tab) && durationMatch && (!filters.flights || item.flights) && item.price <= filters.budget && (!filters.hotel.length || filters.hotel.includes(item.hotel)) && (!filters.city.length || filters.city.includes(item.city)) && (!filters.theme.length || filters.theme.includes(item.theme));
    });
    return result.sort((a, b) => sort === "price" ? a.price - b.price : sort === "rating" ? Number(b.rating) - Number(a.rating) : 0);
  }, [filters, query, sort, tab]);
  const map = destinations[destination];
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${map.lon - 0.08}%2C${map.lat - 0.06}%2C${map.lon + 0.08}%2C${map.lat + 0.06}&layer=mapnik&marker=${map.lat}%2C${map.lon}`;
  const reserve = (type, name) => setServiceMessage(`${name} added to your ${type} plan.`);

  return <div className="packagesPage">
    <section className="packageSearch"><div className="searchField"><b>STARTING FROM</b><input value={startingFrom} onChange={(event) => setStartingFrom(event.target.value)} aria-label="Starting from" /></div><div className="searchField"><b>GOING TO</b><input value={goingTo} onChange={(event) => setGoingTo(event.target.value)} aria-label="Going to" /></div><div className="searchField"><b>STARTING DATE</b><input type="date" value={startingDate} onChange={(event) => setStartingDate(event.target.value)} aria-label="Starting date" /></div><button className="packageSearchButton" onClick={() => { setSearched(true); document.querySelector(".packageResults")?.scrollIntoView({ behavior: "smooth" }); }}><Search /> SEARCH</button><button className="exploreButton" onClick={() => document.querySelector(".packageTabs")?.scrollIntoView({ behavior: "smooth", block: "center" })}><Grid2X2 /> Explore</button></section>
    <section className="packagesHero"><div><h1>South India Tour Packages</h1><p>Visit the land of temples and mountains</p></div></section>
    <main className="packageBooking"><div className="packageTabs">{["ALL PACKAGES", "PILGRIMAGE", "MONSOON FREEBIES", "HONEYMOON"].map((name) => <button className={tab === name ? "selected" : ""} onClick={() => setTab(name)} key={name}>{name} <small>({name === "ALL PACKAGES" ? 148 : name === "PILGRIMAGE" ? 17 : name === "MONSOON FREEBIES" ? 5 : 10})</small></button>)}</div><div className="packageLayout"><Filters filters={filters} onChange={updateFilter} onClear={clearFilters} /><section className="packageResults"><div className="packageResultsTop"><div><label className="packageQuery"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search packages" /></label>{searched && <small className="searchStatus">Showing trips from {startingFrom || "anywhere"} to {goingTo || "South India"}{startingDate ? ` from ${startingDate}` : ""}</small>}</div><label className="sortPackages">Sorted By: <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="popular">Popular</option><option value="price">Price: Low to High</option><option value="rating">Top Rated</option></select><ChevronDown /></label></div><div className="packageCards">{visiblePackages.map((item) => <PackageCard key={item.name} item={item} favorite={favorites.includes(item.name)} onFavorite={() => setFavorites((current) => current.includes(item.name) ? current.filter((name) => name !== item.name) : [...current, item.name])} onDetails={() => setSelected(item)} />)}</div>{visiblePackages.length === 0 && <p className="emptyPackages">No packages match your search. Try clearing a filter.</p>}</section></div></main>
    <section className="tripServices"><div className="servicesHeading"><span>COMPLETE YOUR TRIP</span><h2>Stay, ride and explore</h2><p>Book the essentials around your holiday package in one place.</p></div><div className="serviceTabs"><button className={serviceTab === "hotels" ? "active" : ""} onClick={() => setServiceTab("hotels")}><Hotel /> Hotels</button><button className={serviceTab === "vehicles" ? "active" : ""} onClick={() => setServiceTab("vehicles")}><CarFront /> Rent a vehicle</button><button className={serviceTab === "maps" ? "active" : ""} onClick={() => setServiceTab("maps")}><MapPinned /> Maps</button></div>{serviceTab !== "maps" && <div className="serviceCards">{(serviceTab === "hotels" ? hotels : vehicles).map((item) => <article className="serviceCard" key={item.name}><img src={image(item.image)} alt={item.name} /><div><h3>{item.name}</h3><p>{serviceTab === "hotels" ? `${item.city} · ${item.type}` : item.detail}</p><div className="servicePrice"><strong>₹{item.price.toLocaleString("en-IN")}</strong><small>{serviceTab === "hotels" ? "per night" : "per day"}</small><button onClick={() => reserve(serviceTab === "hotels" ? "hotel booking" : "vehicle rental", item.name)}>{serviceTab === "hotels" ? "Book room" : "Rent now"}</button></div></div></article>)}</div>}{serviceTab === "maps" && <div className="mapPanel"><div className="mapControls"><h3>Explore South India</h3><p>Choose a destination to view it on the map.</p><div className="destinationButtons">{Object.keys(destinations).map((name) => <button className={destination === name ? "active" : ""} onClick={() => setDestination(name)} key={name}>{name}</button>)}</div><a href={`https://www.google.com/maps/search/?api=1&query=${map.lat},${map.lon}`} target="_blank" rel="noreferrer">Open in Google Maps</a></div><iframe title={`${destination} map`} src={mapUrl} loading="lazy" /></div>}{serviceMessage && <div className="serviceMessage" role="status">{serviceMessage}<button onClick={() => setServiceMessage("")} aria-label="Dismiss message"><X /></button></div>}</section>
    <div className="packageSupport"><a href="mailto:support@travelai.example"><MessageCircle /><b>Live Chat</b></a><a href="tel:+911800123456"><Phone /><b>Get a callback</b></a></div>
    <section className="packageTrust"><div><Plane /><b>AI-Powered</b><span>Smart itineraries</span></div><div><IndianRupee /><b>Best Price Guarantee</b><span>Get the best deals</span></div><div><MessageCircle /><b>24/7 Support</b><span>We are here to help</span></div><div><Users /><b>Trusted by 50K+</b><span>Happy travelers</span></div></section>
    {selected && <div className="packageModalBackdrop" role="presentation" onClick={() => setSelected(null)}><section className="packageModal" role="dialog" aria-modal="true" aria-label={selected.name} onClick={(event) => event.stopPropagation()}><button className="closeModal" onClick={() => setSelected(null)} aria-label="Close package details"><X /></button><img src={image(selected.image)} alt="" /><div><span className="packageTag">{selected.label}</span><h2>{selected.name}</h2><p>{selected.duration} itinerary with {selected.hotel} stays, meals, transfers, and curated experiences across {selected.city}.</p><strong>₹{selected.price.toLocaleString("en-IN")} <small>per person</small></strong><button className="bookPackageButton" onClick={() => window.location.href = "/planner"}>Personalize This Trip</button></div></section></div>}
  </div>;
}