const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_DFD, // or hardcode for quick test
});

(async () => {
  try {
    const models = await openai.models.list();
    const available = models.data.map((m) => m.id);
    console.log("✅ Available models for this key:\n", available.join("\n"));
  } catch (err) {
    console.error("❌ Failed to list models:", err.message);
  }
})();
