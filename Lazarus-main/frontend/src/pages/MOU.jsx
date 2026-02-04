import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function MOU() {
  const sigRef = useRef();
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  const handleSubmit = async () => {
    if (sigRef.current.isEmpty()) {
      alert("Please sign the MOU");
      return;
    }

    setLoading(true);

    const signature = sigRef.current
      .getTrimmedCanvas()
      .toDataURL("image/png");

    const res = await fetch("http://localhost:5000/api/mou/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: user.name,
        role: user.role,
        signature,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      localStorage.setItem(`mou_signed_${user.role}`, "true");
      window.open(data.pdfUrl, "_blank");
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 40 }}>
      <h2>Agentic AI Agreement & MOU</h2>

      <p>
        Our Agentic AI autonomously assists in decision making, risk analysis,
        funding prioritization, and compliance monitoring. By proceeding, you
        acknowledge and consent to the use of autonomous AI agents within the
        Lazarus ecosystem.
      </p>

      <h3>Memorandum of Understanding</h3>
      <p>
        This agreement legally binds the participant to the platform terms,
        ethical usage of AI, financial compliance, and dispute resolution
        clauses.
      </p>

      <h4>Digital Signature</h4>

      <SignatureCanvas
        ref={sigRef}
        canvasProps={{
          width: 500,
          height: 200,
          style: { border: "1px solid black" },
        }}
      />

      <br />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Generating PDF..." : "Sign & Generate PDF"}
      </button>
    </div>
  );
}
