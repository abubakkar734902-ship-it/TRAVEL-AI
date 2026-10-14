import { domestic, MiniCard } from "../components/Cards.jsx";
export default function Domestic(){return <section className="section pageTop"><div className="sectionHeading"><span>DOMESTIC TRAVEL</span><h1>Discover incredible India.</h1><p>Explore mountains, beaches, heritage and hidden gems.</p></div><div className="miniGrid">{domestic.map(x=><MiniCard key={x.name} item={x}/>)}</div></section>}
