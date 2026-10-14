import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import PlannerWizard from "./pages/PlannerWizard.jsx";
import Itinerary from "./pages/Itinerary.jsx";
import Discover from "./pages/Discover.jsx";
import Domestic from "./pages/Domestic.jsx";
import International from "./pages/International.jsx";
import Interests from "./pages/Interests.jsx";
import TravelToolkit from "./pages/TravelToolkit.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Copilot from "./pages/Copilot.jsx";
import Budget from "./pages/Budget.jsx";
import Safety from "./pages/Safety.jsx";
import NotFound from "./pages/NotFound.jsx";
import HolidayPackages from "./pages/HolidayPackages.jsx";

function Layout({ children }) { return <><Navbar/><main>{children}</main><Footer/></>; }
export default function App(){ return <BrowserRouter><Routes>
<Route path="/" element={<Layout><Home/></Layout>}/><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/>
<Route path="/planner" element={<PlannerWizard/>}/><Route path="/packages" element={<Layout><HolidayPackages/></Layout>}/><Route path="/itinerary" element={<Layout><Itinerary/></Layout>}/><Route path="/discover" element={<Layout><Discover/></Layout>}/><Route path="/domestic" element={<Layout><Domestic/></Layout>}/><Route path="/international" element={<Layout><International/></Layout>}/><Route path="/interests" element={<Layout><Interests/></Layout>}/><Route path="/toolkit" element={<Layout><TravelToolkit/></Layout>}/><Route path="/dashboard" element={<Layout><Dashboard/></Layout>}/><Route path="/copilot" element={<Layout><Copilot/></Layout>}/><Route path="/budget" element={<Layout><Budget/></Layout>}/><Route path="/safety" element={<Layout><Safety/></Layout>}/><Route path="*" element={<NotFound/>}/>
</Routes></BrowserRouter>; }
