const SYSTEM_PROMPT = `You are a support assistant for a car rental app named CarRental.
Answer clearly and briefly.
You help with: booking flow, owner listing flow, cancellations, account login/reset, and pricing basics.
If a question is unrelated, politely redirect to app support topics.`;

const extractGeneratedText = (data) => {
  if (Array.isArray(data) && data.length > 0 && data[0]?.generated_text) {
    return data[0].generated_text;
  }

  if (data?.generated_text) {
    return data.generated_text;
  }

  if (typeof data === "string") {
    return data;
  }

  return "";
};

export const askHelpAssistant = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.json({ success: false, message: "Question is required" });
    }

    const token = process.env.HUGGINGFACE_API_TOKEN;
    const model = process.env.HUGGINGFACE_MODEL || "google/flan-t5-large";

    if (!token) {
      return res.json({ success: false, message: "AI support is not configured yet" });
    }

    const prompt = `${SYSTEM_PROMPT}\n\nUser question: ${message.trim()}\nAssistant:`;

    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 220,
          temperature: 0.3,
          return_full_text: false,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data?.error || "AI service is temporarily unavailable";
      return res.json({ success: false, message: errorMessage });
    }

    const answer = extractGeneratedText(data).trim();

    if (!answer) {
      return res.json({ success: false, message: "No response generated" });
    }

    return res.json({ success: true, answer });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
