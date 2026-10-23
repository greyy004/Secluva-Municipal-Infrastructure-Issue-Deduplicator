import React, { useState } from "react";
import axios from "axios";
import "./Report.css";

function Report() {
  const [reportOne, setReportOne] = useState("");
  const [reportTwo, setReportTwo] = useState("");
  const [output, setOutput] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOutput(null);
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/reports/vectors",
        {
          text1: reportOne,
          text2: reportTwo,
        },
      );

      setOutput(response.data);
    } catch (err) {
      console.error("Error comparing reports:", err);

      setError(
        err.response?.data?.error ||
          "Could not compare reports. Check that the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="report-page">
      <div className="report-shell">
        <header className="report-heading">
          <span className="report-eyebrow">Report analysis</span>
          <h1>Compare two reports</h1>
          <p>Check how closely two reports match. Add the text below and we’ll calculate their similarity.</p>
        </header>

        <form className="report-form" onSubmit={handleSubmit}>
          <div className="report-fields">
            <div className="report-field">
              <label htmlFor="report_one"><span>01</span> First report</label>
              <textarea
                id="report_one"
                placeholder="Paste or write the first report here..."
                value={reportOne}
                onChange={(e) => setReportOne(e.target.value)}
                required
              />
            </div>

            <div className="report-field">
              <label htmlFor="report_two"><span>02</span> Second report</label>
              <textarea
                id="report_two"
                placeholder="Paste or write the second report here..."
                value={reportTwo}
                onChange={(e) => setReportTwo(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="report-form-footer">
            <span>Both reports are required to compare.</span>
            <button type="submit" disabled={loading}>
              {loading ? "Comparing..." : "Compare reports"}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </div>
        </form>

        {error && <p className="report-error" role="alert">{error}</p>}

        {output && (
          <section className="report-result" aria-live="polite">
            <div>
              <span className="report-result-label">Comparison result</span>
              <h2>Reports analyzed</h2>
            </div>
            <div className="report-result-score">
              <strong>{output.percentage}%</strong>
              <span>similarity</span>
            </div>
            <p className="report-raw-score">Cosine similarity score: {output.similarity}</p>
          </section>
        )}
      </div>
    </main>
  );
}

export default Report;
