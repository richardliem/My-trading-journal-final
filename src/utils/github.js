export class GitHubStorage {
  constructor({ token, owner, repo, branch = "main" }) {
    this.token = token;
    this.owner = owner;
    this.repo = repo;
    this.branch = branch;
    this.filePath = "trades.json";
    this.base = "https://api.github.com";
  }

  headers() {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
    };
  }

  async getFileSha() {
    const res = await fetch(
      `${this.base}/repos/${this.owner}/${this.repo}/contents/${this.filePath}?ref=${this.branch}`,
      { headers: this.headers() }
    );
    if (res.status === 404) return null;
    const data = await res.json();
    return { sha: data.sha, content: data.content };
  }

  async loadTrades() {
    const file = await this.getFileSha();
    if (!file) return [];
    const decoded = atob(file.content.replace(/\n/g, ""));
    return JSON.parse(decoded);
  }

  async saveTrades(trades) {
    const file = await this.getFileSha();
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(trades, null, 2))));
    const body = {
      message: `Update trades - ${new Date().toISOString()}`,
      content,
      branch: this.branch,
    };
    if (file?.sha) body.sha = file.sha;

    const res = await fetch(
      `${this.base}/repos/${this.owner}/${this.repo}/contents/${this.filePath}`,
      { method: "PUT", headers: this.headers(), body: JSON.stringify(body) }
    );
    if (!res.ok) throw new Error("GitHub save failed");
    return res.json();
  }
}
