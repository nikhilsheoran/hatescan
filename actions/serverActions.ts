"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import deepgramClient from "@/lib/deepgram";
import fs from "fs";

export async function analyzeVideo(transcript: string, screenshots?: string[]) {
  const { object } = await generateObject({
    model: google("gemini-2.0-flash"),
    schema: z.object({
      score: z.number().describe("The score of the video from 0 to 100"),
      summary: z.string().describe("A summary of the video"),
    }),
    system: `
            Analyze the following video content for radical and religious extremism. Consider:
            1. Hate speech and discriminatory language
            2. Calls for violence or extremist actions
            3. Religious extremism and intolerance
        `,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `This is the video transcript: ${transcript}`,
          },
          ...(screenshots?.map((screenshot) => ({
            type: "image" as const,
            image: screenshot,
          })) || []),
        ],
      },
    ],
  });

  return object;
}

export async function getTranscript(videoId: string) {
  if (!process.env.SIEVE_API_KEY) {
    console.error("SIEVE_API_KEY is not set");
    return { result: "SIEVE_API_KEY is not set", status: 500 };
  }
  const sieveJob = await fetch(`https://mango.sievedata.com/v2/push`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": process.env.SIEVE_API_KEY,
    },
    body: JSON.stringify({
      function: "sieve/youtube-downloader",
      inputs: {
        url: `https://www.youtube.com/watch?v=${videoId}`,
        download_type: "audio",
        resolution: "highest-available",
        include_audio: true,
        start_time: 0,
        end_time: -1,
        audio_format: "mp3",
      },
    }),
  });
  let sieveJobJson = await sieveJob.json();
  const sieveJobId = sieveJobJson.id;

  while (sieveJobJson.status !== "finished") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const sieveRes = await fetch(
      `https://mango.sievedata.com/v2/jobs/${sieveJobId}`,
      {
        headers: {
          "X-Api-Key": process.env.SIEVE_API_KEY,
        },
      }
    );
    sieveJobJson = await sieveRes.json();
  }
  console.log("sieveJobJson", sieveJobJson.outputs[0].data.url, null, 2);

  const deepgramRes = await fetch(
    "https://api.deepgram.com/v1/listen?model=nova-2&language=hi-Latn",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
      },
      body: JSON.stringify({ url: sieveJobJson.outputs[0].data.url }),
    }
  );
  const deepgramJson = await deepgramRes.json();
  console.log("deepgramJson", deepgramJson.results.channels[0], null, 2);
  return {
    result: deepgramJson.results.channels[0].alternatives[0].transcript,
    status: 200,
  };
}
