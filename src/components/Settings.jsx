import { useState } from "react";
import { GitHubStorage } from "../utils/github";

export default function Settings({ config, onSave }) {
  const [form, setForm] = useState(config || { token: "", owner: "", repo: "", branch: "main" });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const gh = new GitHubStorage(form);
      await gh.loadTrades();
      setTestResult("success");
    } catch {
      setTestResult("error");
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSave(form);
    setTestResult(null);
  };

  const handleClear = () => {
    if (confirm("Clear all trades from local storage?")) {
      localStorage.removeItem("trades");
      window.location.reload();
    }
  };

  return (
    <div className="settings">
      <div className="settings-section">
        <h2 className="section-title">GitHub Storage</h2>
        <p className="settings-desc">
          Connect your GitHub repository to sync trades across devices. Your trades will be saved as <code>trades.json</code> in the root of your repo.
        </p>

        <div className="settings-steps">
          <div className="step">
            <span className="step-num">1</span>
            <span>Create a new <strong>private repository</strong> on GitHub (e.g. <code>my-trading-journal</code>)</span>
          </div>
          <div className="step">
            <span className="step-num">2</span>
            <span>Go to <strong>Settings → Developer Settings → Personal Access Tokens → Fine-grained tokens</strong></span>
          </div>
          <div className="step">
            <span className="step-num">3</span>
            <span>Create a token with <strong>Contents: Read & Write</strong> permission for your repo</span>
          </div>
          <div className="step">
            <span className="step-num">4</span>
            <span>Paste the token below and fill in your details</span>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group full">
            <label>Personal Access Token</label>
            <input
              type="password"
              placeholder="github_pat_..."
              value={form.token}
              onChange={(e) => set("token", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>GitHub Username</label>
            <input placeholder="your-username" value={form.owner} onChange={(e) => set("owner", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Repository Name</label>
            <input placeholder="my-trading-journal" value={form.repo} onChange={(e) => set("repo", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Branch</label>
            <input placeholder="main" value={form.branch} onChange={(e) => set("branch", e.target.value)} />
          </div>
        </div>

        <div className="settings-actions">
          <button className="btn-cancel" onClick={handleTest} disabled={testing || !form.token}>
            {testing ? "Testing..." : "Test Connection"}
          </button>
          <button className="btn-submit" onClick={handleSave}>Save & Connect</button>
        </div>

        {testResult && (
          <div className={`test-result ${testResult}`}>
            {testResult === "success" ? "✓ Connection successful! GitHub is ready." : "✕ Connection failed. Check your token and repository name."}
          </div>
        )}
      </div>

      <div className="settings-section danger-zone">
        <h2 className="section-title">Danger Zone</h2>
        <div className="danger-row">
          <div>
            <strong>Clear Local Data</strong>
            <p>Remove all trades stored in browser localStorage</p>
          </div>
          <button className="btn-danger" onClick={handleClear}>Clear All</button>
        </div>
      </div>
    </div>
  );
}
