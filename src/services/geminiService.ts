export async function summarizeArticle(title: string, content: string, token?: string): Promise<string> {
  try {
    const response = await fetch("/api/summarize", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ title, content }),
    });
    
    if (response.status === 401) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Authentication required");
    }
    
    if (!response.ok) throw new Error("Failed to summarize");
    const data = await response.json();
    return data.summary || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini Summarization Error:", error);
    throw error;
  }
}

export async function checkAuthenticity(title: string, content: string, token?: string): Promise<{ classification: 'REAL' | 'FAKE' | 'UNCERTAIN', reason: string }> {
  try {
    const response = await fetch("/api/verify", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ title, content }),
    });

    if (response.status === 401) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Authentication required");
    }

    if (!response.ok) throw new Error("Failed to verify");
    const data = await response.json();
    return {
      classification: data.classification || 'UNCERTAIN',
      reason: data.reason || "Could not determine authenticity."
    };
  } catch (error) {
    console.error("Gemini Authenticity Error:", error);
    throw error;
  }
}
