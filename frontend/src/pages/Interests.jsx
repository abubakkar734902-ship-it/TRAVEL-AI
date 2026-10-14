import { Link } from "react-router-dom";
import { interests } from "../components/Cards.jsx";
export default function Interests(){return <section className="section pageTop"><div className="sectionHeading"><span>TRAVEL BY INTEREST</span><h1>What kind of trip do you want?</h1><p>Choose a vibe and TravelAI will build the journey around it.</p></div><div className="interestLargeGrid">{interests.map((x,i)=><Link to="/planner" className="interestLarge" key={x}><div>{["🌿","🚗","🥾","🏖️","❤️","⛰️"][i]}</div><h2>{x}</h2><span>Build my trip →</span></Link>)}</div></section>}
