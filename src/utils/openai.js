import axios from "axios";

const API_KEY = "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"; // Replace with your key

export const generateJobDescription = async (title) => {
  const prompt = `Write a professional and detailed job description for the position: ${title}. Mention key responsibilities, required skills, and qualifications.`;

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    },
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0].message.content.trim();
};
