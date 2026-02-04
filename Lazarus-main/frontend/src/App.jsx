import { Routes, Route } from "react-router-dom";
import CreateProject from "./pages/CreateProject";
import ProjectPage from "./pages/ProjectPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<CreateProject />} />
      <Route path="/project" element={<ProjectPage />} />
    </Routes>
  );
}

export default App;
