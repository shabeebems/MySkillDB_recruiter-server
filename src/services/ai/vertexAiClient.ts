import * as dotenv from "dotenv";
import { VertexAI } from "@google-cloud/vertexai";

dotenv.config();

// Vertex AI Configuration from Environment Variables
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || "my-skill-extractor-app";
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "asia-south1";
const MODEL_ID = process.env.GOOGLE_CLOUD_MODEL || "gemini-2.5-flash";

/**
 * Initialize and export Vertex AI Client
 * Uses credentials from environment variables
 */
export const vertexAi = new VertexAI({
  project: PROJECT_ID,
  location: LOCATION,
  googleAuthOptions: {
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"), // Handle escaped newlines
    },
  },
});

/**
 * Get the configured generative model
 */
export const getGenerativeModel = () => {
  return vertexAi.getGenerativeModel({ model: MODEL_ID });
};

/**
 * Get configuration constants
 */
export const getVertexAiConfig = () => ({
  projectId: PROJECT_ID,
  location: LOCATION,
  modelId: MODEL_ID,
});

