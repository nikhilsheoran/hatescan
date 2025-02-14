"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  analyzeVideo,
  createSieveJob,
  getSieveJob,
  getTranscript,
} from "@/actions/serverActions";
import { Loader2 } from "lucide-react";
import ScoreIndicator from "@/components/ScoreIndicator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    summary: string;
    transcript: string;
  }>();

  async function handleSubmit() {
    setLoading(true);
    let sieveJobJson = await createSieveJob(
      url.split("v=")[1] ||
        url.split("youtu.be/")[1] ||
        url.split("shorts/")[1] ||
        url
    );
    while (sieveJobJson.status !== "finished") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      sieveJobJson = await getSieveJob(sieveJobJson.id);
    }
    const transcript = await getTranscript(sieveJobJson.outputs[0].data.url);
    const result = await analyzeVideo(transcript.result);
    setResult({ ...result, transcript: transcript.result });
    toast.success("Video analyzed successfully");
    setLoading(false);
  }

  return (
    <main className="flex flex-col gap-8 items-center justify-center min-h-screen py-12 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col gap-4 items-center text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
          Radical & Religious Content Analyzer
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
          Analyze video content for radical and religious extremism using AI.
        </p>
      </div>
      <div className="flex gap-4">
        <Input
          type="text"
          placeholder="Enter YouTube URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-96"
          autoFocus
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
        />
        <Button
          type="submit"
          disabled={loading}
          onClick={handleSubmit}
          className="shadow-md"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze"
          )}
        </Button>
      </div>

      {url && (
        <div className="mt-8">
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${url.split("v=")[1] || url}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg shadow-xl"
          />
        </div>
      )}

      {result && (
        <div className="mt-12 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-5xl">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
            Analysis Results
          </h2>

          <div className="mb-6 w-full">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Score
            </h3>
            <ScoreIndicator score={result.score} />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Summary
            </h3>
            <p className="text-gray-600 dark:text-gray-300">{result.summary}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Transcript
            </h3>
            <Textarea
              value={result.transcript}
              readOnly
              className="mt-2 h-48 text-gray-600 dark:text-gray-300"
            />
          </div>
        </div>
      )}
    </main>
  );
}
