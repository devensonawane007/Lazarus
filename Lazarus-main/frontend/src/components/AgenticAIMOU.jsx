import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function AgenticAIMOU() {
  const sigRef = useRef();
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const mouKey = `mou_signed_${user.role}`;
  const mouSigned = localStorage.getItem(mouKey) === "true";

  const handleSign = async () => {
    if (sigRef.current.isEmpty()) {
      alert("Please sign before submitting");
      return;
    }

    setLoading(true);

    const signature = sigRef.current
      .getTrimmedCanvas()
      .toDataURL("image/png");

    try {
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

      if (data.success) {
        localStorage.setItem(mouKey, "true");
        window.open(data.pdfUrl, "_blank");
      }
    } catch (err) {
      alert("Failed to generate MOU");
    }

    setLoading(false);
  };

  return (
    <div style={{ marginTop: 40 }}>
      <h3>Agentic AI Agreement & MOU</h3>

      <p>
        Lazarus uses Agentic AI systems that autonomously assist in decision
        making, risk analysis, funding prioritization, and compliance
        enforcement. By proceeding, you acknowledge and consent to the use of
        autonomous AI agents.
      </p>

      <p>
        This Memorandum of Understanding (MOU) legally binds you to platform
        policies, ethical AI usage, and dispute resolution terms.
      </p>

      {mouSigned ? (
        <p style={{ color: "green", fontWeight: "bold" }}>
          ✔ MOU Signed & Locked
        </p>
      ) : (
        <>
          <SignatureCanvas
            ref={sigRef}
            canvasProps={{
              width: 450,
              height: 180,
              style: { border: "1px solid #000" },
            }}
          />

          <br />

          <button onClick={handleSign} disabled={loading}>
            {loading ? "Generating PDF..." : "Sign & Generate MOU PDF"}
          </button>
        </>
      )}
    </div>
  );
}
