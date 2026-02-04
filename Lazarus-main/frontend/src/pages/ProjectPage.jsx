import { useLocation } from "react-router-dom";

export default function ProjectPage() {
  const location = useLocation();
  const project = location.state;

  if (!project) {
    return <h2>No project data found</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>{project.title}</h1>

      <p><b>Description:</b> {project.description}</p>
      <p><b>Video Type:</b> {project.video_type}</p>
      <p><b>Funding Target:</b> ₹{project.funding_target}</p>
      <p><b>Status:</b> {project.status}</p>

      <h3>Allowed Expenses</h3>
      <ul>
        {project.allowed_expenses.map((exp, index) => (
          <li key={index}>{exp}</li>
        ))}
      </ul>
    </div>
  );
}
