import { LandingPage } from "./components/Landingpage";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Signin from "./components/Signin";
import Signup from "./components/Signup";
import Workflows from "./components/Workflows";
import { CreateWorkflow } from "./components/CreateWorkflow";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/workflow/create" element={<CreateWorkflow />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
