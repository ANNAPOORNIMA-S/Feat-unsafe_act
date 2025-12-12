
import { SafetyObservation } from '../types';
import { GoogleGenAI, Type, FunctionDeclaration, Chat } from "@google/genai";

// 1. Define the Advanced Tool Interface
// This mimics a database query structure (SELECT * FROM data WHERE filters GROUP BY field)
const queryTool: FunctionDeclaration = {
  name: "query_safety_data",
  description: "Advanced query tool for safety data. Use this for ALL quantitative questions, lookups, and aggregations. Supports exact matching, searching, and range comparisons for dates/times.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      filters: {
        type: Type.ARRAY,
        description: "List of conditions to filter the data. All conditions must be met (AND logic).",
        items: {
          type: Type.OBJECT,
          properties: {
            field: { 
              type: Type.STRING, 
              description: "The field to filter by. Options: 'id', 'vessel', 'dateReported', 'timeReported', 'observerName', 'observerRank', 'type', 'category' (Risk), 'outcome', 'description', 'consequences', 'mappedIssue', 'areaOfWork', 'observationRelatedTo1'." 
            },
            operator: { 
              type: Type.STRING, 
              description: "Comparison operator. Options: 'equals' (exact), 'contains' (partial), 'gt' (greater than), 'lt' (less than), 'gte' (>=), 'lte' (<=)." 
            },
            value: { 
              type: Type.STRING, 
              description: "The value to search for (e.g., 'MAG Capella', 'High Risk', '19:30', '03-11-2025', 'Mental Health')." 
            }
          },
          required: ["field", "operator", "value"]
        }
      },
      groupBy: {
        type: Type.STRING,
        description: "Field to group results by. Use this for 'Top 5' or 'Distribution' questions. E.g., group by 'vessel' to see which vessel has the most issues."
      },
      limit: {
        type: Type.NUMBER,
        description: "Max number of sample records to return for reading details. Default 5."
      }
    },
  }
};

export class ChatService {
  private ai: GoogleGenAI | null = null;
  private chat: Chat | null = null;
  private data: SafetyObservation[] = [];

  constructor(data: SafetyObservation[]) {
    this.data = data;
    
    let apiKey: string | undefined;

    // 1. Try Standard Vite Env Var (Best Practice)
    if (import.meta.env && import.meta.env.VITE_API_KEY) {
      apiKey = import.meta.env.VITE_API_KEY;
    } 
    // 2. Fallback to process.env for other environments
    else {
      try {
        // @ts-ignore
        apiKey = process.env.API_KEY || process.env.VITE_API_KEY;
      } catch (e) {
        // ignore
      }
    }
    
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
      this.initChat();
    } else {
      console.error("[ChatService] API Key missing. Please create a .env file with VITE_API_KEY=your_key");
    }
  }

  private initChat() {
    if (!this.ai) return;

    const systemInstruction = `You are an elite HSE Data Analyst.
    Your specific goal is to execute PRECISE queries against the safety database.

    CRITICAL RULES:
    1. **Field Mapping**:
       - 'Mental Health' -> usually found in field 'observationRelatedTo1' or 'mappedIssue'. Try filtering 'observationRelatedTo1' contains 'Mental'.
       - 'Procedures' -> filter 'observationRelatedTo1' contains 'Procedure' or 'mappedIssue' contains 'Procedure'.
       - 'Observer' questions -> use 'observerName' or 'observerRank'.
       - 'Time' questions -> use 'timeReported'.
    2. **Time Ranges**: 
       - If user asks "19:30 to 19:32", use TWO filters:
         - { field: 'timeReported', operator: 'gte', value: '19:30:00' }
         - { field: 'timeReported', operator: 'lte', value: '19:32:00' }
    3. **Date Lookups**: If asked about a date (e.g., "03-11-2025"), use filter field 'dateReported' equals the value.
    4. **Aggregations**: 
       - If asked "Top 5 high risk vessels", FILTER by category='High Risk' AND GROUP BY 'vessel'.
    5. **Zero Results**: If a query returns 0, verify if the search term might need to be broader (e.g., 'contains' instead of 'equals').
    6. **Response Style**: Be professional, direct, and data-heavy. Start with the direct answer.
    
    Data Schema Hints:
    - 'Risk' -> field: 'category'
    - 'Type' -> field: 'type'
    - 'Consequences' -> field: 'consequences'
    - 'Issue' -> field: 'mappedIssue'
    - 'Related To' -> field: 'observationRelatedTo1'
    - 'Observer Name' -> field: 'observerName'
    - 'Rank' -> field: 'observerRank'
    `;

    this.chat = this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: [queryTool] }],
        temperature: 0, // Zero temperature for maximum logic precision
      }
    });
  }

  // --- Advanced Query Logic ---
  private executeQuery(args: any): any {
    let result = [...this.data];

    // 1. Apply Filters
    if (args.filters && Array.isArray(args.filters)) {
      args.filters.forEach((f: any) => {
        const field = f.field as keyof SafetyObservation;
        // Normalize value string for comparison
        const valStr = (f.value || '').toString().toLowerCase().trim();

        result = result.filter(item => {
          // Safety check for undefined fields
          const itemVal = (item[field] || '').toString();
          const itemValLower = itemVal.toLowerCase();

          switch (f.operator) {
            case 'equals':
              return itemValLower === valStr;
            case 'contains':
              return itemValLower.includes(valStr);
            case 'gt':
              return itemVal > (f.value || '').toString();
            case 'lt':
              return itemVal < (f.value || '').toString();
            case 'gte':
              return itemVal >= (f.value || '').toString();
            case 'lte':
              return itemVal <= (f.value || '').toString();
            default:
              return false;
          }
        });
      });
    }

    const count = result.length;
    let analysis = {};

    // 2. Handle Grouping (Aggregations)
    if (args.groupBy) {
      const field = args.groupBy as keyof SafetyObservation;
      const groups: Record<string, number> = {};
      
      result.forEach(item => {
        const key = (item[field] || 'Unspecified').toString();
        groups[key] = (groups[key] || 0) + 1;
      });

      // Sort by count descending
      analysis = Object.entries(groups)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10) // Top 10 groups
        .reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {});
    }

    // 3. Prepare Samples
    const limit = args.limit || 5;
    const samples = result.slice(0, limit).map(d => ({
      id: d.id,
      date: d.dateReported,
      time: d.timeReported,
      vessel: d.vessel,
      observer: `${d.observerName} (${d.observerRank})`,
      type: d.type,
      risk: d.category,
      relatedTo: d.observationRelatedTo1,
      desc: d.description ? d.description.substring(0, 80) + "..." : "",
    }));

    return {
      total_count: count,
      filters_applied: args.filters,
      aggregation_result: Object.keys(analysis).length > 0 ? analysis : "No grouping requested",
      sample_records: samples
    };
  }

  // --- Wrapper for Retry Logic ---
  private async sendMessageWithRetry(content: any, retries = 3, delay = 2000): Promise<any> {
    try {
      if (!this.chat) throw new Error("Chat session not initialized");
      return await this.chat.sendMessage(content);
    } catch (error: any) {
      // Analyze error using JSON stringification to catch nested structures reliably
      const errString = JSON.stringify(error, null, 2).toLowerCase();
      
      // Check for hard Quota limits (429 Resource Exhausted)
      const isQuota = errString.includes('quota') || errString.includes('resource_exhausted');
      
      // Check for transient Rate Limits (429 Too Many Requests)
      const isRateLimit = errString.includes('429') || errString.includes('too many requests');

      if (isQuota) {
        console.warn("[ChatService] Quota exceeded (Hard Limit). Cancelling retries.");
        throw error; // Fail fast
      }

      if (retries > 0 && isRateLimit) {
        console.warn(`[ChatService] Rate limit hit (429). Retrying in ${delay}ms... (Attempts left: ${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.sendMessageWithRetry(content, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  public async sendMessage(message: string): Promise<string> {
    if (!this.chat) {
       return "System Error: AI Service not initialized. Please ensure the .env file exists with VITE_API_KEY set, and restart the application.";
    }

    try {
      // 1. Send User Message with Retry
      let response = await this.sendMessageWithRetry({ message });
      
      let functionCalls = response.functionCalls;
      let turns = 0;
      const MAX_TURNS = 5;

      while (functionCalls && functionCalls.length > 0 && turns < MAX_TURNS) {
        turns++;
        const toolResponses = functionCalls.map((call: any) => {
           const result = this.executeQuery(call.args);
           return {
             functionResponse: {
               name: call.name,
               id: call.id,
               response: { result }
             }
           };
        });

        // 2. Send Tool Responses with Retry
        response = await this.sendMessageWithRetry({ message: toolResponses });
        functionCalls = response.functionCalls;
      }

      return response.text || "Query processed, but no text summary generated.";

    } catch (err: any) {
      // Robust error parsing
      const errString = JSON.stringify(err).toLowerCase();
      const msg = (err?.message || '').toLowerCase();
      
      // Handle Quota/Rate Limit gracefully
      if (
          errString.includes('429') || 
          errString.includes('quota') || 
          errString.includes('resource_exhausted') ||
          msg.includes('quota')
      ) {
         console.warn("[ChatService] Quota exceeded. Returning user message.");
         return "⚠️ System Alert: I have reached my daily usage limit (Quota Exceeded). This typically resets daily. Please check your API plan or try again later.";
      }

      console.error("Chat Logic Error:", err);
      return "I encountered a technical error processing that specific query. Please try simplifying your request.";
    }
  }
}
