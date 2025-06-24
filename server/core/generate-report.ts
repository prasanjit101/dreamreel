import { env } from "@/env";
import { Category } from "@/lib/constant";
import { createId } from "@paralleldrive/cuid2";
import { ReportInsert } from "../db/schema/reports";
import { GenerateReportSystemPrompt } from "./prompt";

export const generateAIReport = async (category: Category): Promise<ReportInsert> => {
  const perplexityApiKey = env.PERPLEXITY_API_KEY;

  try {
    const yesterday = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedDate = `${yesterday.getMonth() + 1}/${yesterday.getDate()}/${yesterday.getFullYear()}`;

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${perplexityApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content: GenerateReportSystemPrompt(category),
          },
          {
            role: "user",
            content: `Generate a report on "${category.toUpperCase()}" from trusted and professional sources within the last 24 hours`,
          },
        ],
        "search_after_date_filter": formattedDate
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Perplexity API error: ${response.status} - ${JSON.stringify(errorData)}`);
      return {
        id: createId(),
        category,
        content: ``,
        date: new Date(),
        error: `API_ERROR | Error generating report: ${errorData.error?.message || response.statusText}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const data = await response.json();
    const generatedContent = data.choices[0]?.message?.content || "No content generated.";

    return {
      id: createId(),
      category,
      content: generatedContent,
      date: new Date(),
      citations: data?.citations || [],
      error: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("Failed to generate AI report:", error);
    return {
      id: createId(),
      category,
      content: ``,
      date: new Date(),
      error: `NETWORK_ERROR | Error generating report: ${error instanceof Error ? error.message : String(error)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
};
