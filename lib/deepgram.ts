import { createClient, DeepgramClient } from "@deepgram/sdk";

if (!process.env.DEEPGRAM_API_KEY) {
    console.error("DEEPGRAM_API_KEY is not set");
    throw new Error("DEEPGRAM_API_KEY is not set");
}

declare global {
    var deepgramClient: DeepgramClient | undefined;
}

export default globalThis.deepgramClient ?? createClient(process.env.DEEPGRAM_API_KEY);