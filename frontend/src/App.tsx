import { LandingPage } from "./components/Landingpage";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Signin from "./components/Signin";
import Signup from "./components/Signup";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
