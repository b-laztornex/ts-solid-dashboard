import type { Component } from "solid-js";
import { Router, Route } from "@solidjs/router";
import Overview from "./pages/Overview";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Patient from "./pages/Patient";

const App: Component = () => {
  return (
    <div class="flex flex-col min-h-screen">
      <Navbar />
      <Router>
        <Route path="/" component={Overview} />
        <Route path="/patients/:id" component={Patient} />
      </Router>
      <Footer />
    </div>
  );
};

export default App;
