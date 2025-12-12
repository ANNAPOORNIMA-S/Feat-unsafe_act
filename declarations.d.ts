declare module '@google/genai' {
  export enum Type {
    TYPE_UNSPECIFIED = 'TYPE_UNSPECIFIED',
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    INTEGER = 'INTEGER',
    BOOLEAN = 'BOOLEAN',
    ARRAY = 'ARRAY',
    OBJECT = 'OBJECT',
    NULL = 'NULL',
  }

  export interface Schema {
    type?: Type;
    format?: string;
    description?: string;
    nullable?: boolean;
    enum?: string[];
    properties?: { [key: string]: Schema };
    required?: string[];
    items?: Schema;
  }

  export interface FunctionDeclaration {
    name: string;
    description?: string;
    parameters?: Schema;
  }

  export interface Tool {
    functionDeclarations?: FunctionDeclaration[];
    googleSearch?: any;
    googleMaps?: any;
  }

  export interface GenerateContentConfig {
    systemInstruction?: string;
    temperature?: number;
    topP?: number;
    topK?: number;
    candidateCount?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
    responseSchema?: any;
    tools?: Tool[];
  }

  export interface FunctionCall {
    name: string;
    args: any;
    id?: string;
  }

  export interface GenerateContentResponse {
    text: string;
    functionCalls?: FunctionCall[];
    candidates?: any[];
  }

  export interface Chat {
    sendMessage(content: any): Promise<GenerateContentResponse>;
    sendMessageStream(content: any): Promise<AsyncIterable<GenerateContentResponse>>;
  }

  export class GoogleGenAI {
    constructor(params: { apiKey: string });
    models: {
      generateContent(params: {
        model: string;
        contents: any;
        config?: GenerateContentConfig;
      }): Promise<GenerateContentResponse>;
      generateContentStream(params: {
        model: string;
        contents: any;
        config?: GenerateContentConfig;
      }): Promise<AsyncIterable<GenerateContentResponse>>;
    };
    chats: {
      create(params: {
        model: string;
        config?: GenerateContentConfig;
        history?: any[];
      }): Chat;
    };
  }
}
