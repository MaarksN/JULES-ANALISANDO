export class SalesOS {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = "https://api.salesos.com") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async createLead(lead: any) {
    const res = await fetch(`${this.baseUrl}/public/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify(lead),
    });
    return res.json();
  }
}
