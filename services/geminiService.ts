import { GoogleGenAI, Type } from "@google/genai";
import { Lead, AppSettings, Priority } from "../types";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key not found");
    }
    return new GoogleGenAI({ apiKey });
};

export const extractLeadsFromText = async (text: string): Promise<Omit<Lead, 'id' | 'status'>[]> => {
    if (!text.trim()) return [];

    const ai = getClient();
    
    // We use gemini-2.5-flash for fast and structured extraction
    const model = 'gemini-2.5-flash';

    const prompt = `
    Analyze the following text and extract a list of sales leads. 
    For each lead, extract details, assign a PRIORITY level, and identify the SOURCE PLATFORM.
    
    Priority Logic:
    - "Paid": If they explicitly mention a budget, "hiring", "looking to buy", or are an existing customer.
    - "High": C-level executives (CEO, CTO, Founder) with a clear pain point or urgent need.
    - "Solid": Relevant job titles with a specific problem or inquiry.
    - "Standard": General inquiries, students, or vague context.

    Platform Logic:
    - "LinkedIn": If LinkedIn URLs or typical LinkedIn phrasing ("Connections", "InMail") is present.
    - "Twitter": If "Tweet", "@handle", "X.com" or twitter URLs are present.
    - "Reddit": If "reddit.com", "r/", "u/", or typical Reddit karma/sub phrasing is present.
    - "Email": If the source seems to be a direct email or mentions "Emailed you".
    - "Instagram": If "IG", "Story", or instagram URLs.
    - "Website": If it comes from a generic contact form or website.
    - "Other": Default if unknown.

    Fields to extract:
    - Name (or "Unknown")
    - Company (or "Unknown")
    - Role / Job Title (or "Unknown")
    - Industry (Infer from context)
    - Email Address (if available)
    - Location (City, Country if available)
    - Post Date (e.g., "2d ago")
    - Post Link (URL)
    - Original Post Text (Full content)
    - Context (Summary for DM generation)
    - Platform (e.g., "LinkedIn", "Twitter", "Reddit", "Email", "Instagram", "Website", "Other")
    - Priority (One of: "Paid", "High", "Solid", "Standard")
    
    Input Text:
    "${text}"
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            company: { type: Type.STRING },
                            role: { type: Type.STRING },
                            industry: { type: Type.STRING },
                            email: { type: Type.STRING },
                            location: { type: Type.STRING },
                            postDate: { type: Type.STRING },
                            postLink: { type: Type.STRING },
                            originalPostText: { type: Type.STRING },
                            context: { type: Type.STRING },
                            platform: { type: Type.STRING },
                            priority: { type: Type.STRING, enum: ["Paid", "High", "Solid", "Standard"] },
                        },
                        required: ["name", "context"],
                    },
                },
            },
        });

        const jsonStr = response.text;
        if (!jsonStr) return [];
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error extracting leads:", error);
        throw error;
    }
};

export const generateLeadMessage = async (lead: Lead, settings: AppSettings): Promise<string> => {
    const ai = getClient();
    
    // Use gemini-3-pro-preview for higher quality creative writing
    const model = 'gemini-3-pro-preview';

    const prompt = `
    You are a world-class copywriter and sales expert.
    Write a direct message (DM) for a lead found on ${lead.platform || "a social platform"}.
    
    Details:
    Name: ${lead.name}
    Company: ${lead.company}
    Role: ${lead.role}
    Location: ${lead.location || "N/A"}
    Original Post: "${lead.originalPostText || "N/A"}"
    Context/Notes: ${lead.context}
    Priority Level: ${lead.priority || "Standard"}
    
    Settings:
    - Tone: ${settings.tone}
    - Length: ${settings.length}
    - Language: ${settings.language}
    
    Instructions:
    - Be personal and engaging. Reference their location or specific words from their post if relevant.
    - Adapt the style to the platform (e.g., LinkedIn is professional but conversational, Twitter is short and punchy, Reddit is community-focused and authentic, Email is structured).
    - Do not sound robotic or generic.
    - Focus on starting a conversation, not just selling.
    - Return ONLY the message body. No subject lines or headers unless typical for a DM on that platform.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });

        return response.text || "Could not generate message.";
    } catch (error) {
        console.error(`Error generating message for ${lead.name}:`, error);
        return "Error generating message. Please try again.";
    }
};