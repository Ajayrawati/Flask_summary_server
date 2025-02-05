import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { YoutubeTranscript } from "youtube-transcript";
import url from "url";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Function to extract YouTube video ID from URL
export function extractYouTubeID(videoUrl) {
  const parsedUrl = new URL(videoUrl);
  if (parsedUrl.hostname.includes("youtube.com")) {
    return parsedUrl.searchParams.get("v");
  } else if (parsedUrl.hostname.includes("youtu.be")) {
    return parsedUrl.pathname.substring(1);
  }
  return null;
}

// Function to fetch YouTube transcript
export async function getYouTubeTranscript(youtubeUrl) {
    try {
      const videoId = extractYouTubeID(youtubeUrl);
      if (!videoId) {
        console.log("Invalid YouTube URL.");
        return null;
      }
  
      
  
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      const formattedText = transcript.map((entry) => entry.text).join(".\n");
      return formattedText;
    } catch (error) {
      console.error("Error fetching transcript:", error);
      return null;
    }
  }
  


// Function to summarize transcript using Google Gemini AI
export async function summarize(transcriptText) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prePrompt = `
        You are a YouTube video summarizer. You will be taking the transcript text
and summarizing the entire video and providing the important summary in points
must be more than 500 words This summaryy should be long and detailed you are allowed to use your knowladge to extend detail but that should be relevent. Extract detailed and accurate notes that highlight all relevant facts, figures, key points, and critical information. The notes should be comprehensive, covering all significant details and avoiding unnecessary filler or repetition. Ensure the facts, dates, names, and numerical data are preserved accurately. The notes should be long enough to provide a thorough understanding of the content, summarizing the main ideas while maintaining enough detail for clarity. Structure the notes logically, with bullet points or sections where necessary to organize the information.
        `;

    const fullPrompt = `${prePrompt}\n\nTranscript: ${transcriptText}`;

    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Summary could not be generated.";
  }
}
