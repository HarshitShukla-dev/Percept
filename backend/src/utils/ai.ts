import { GoogleGenerativeAI } from '@google/generative-ai';
import { SpeechClient } from '@google-cloud/speech';
import { protos } from '@google-cloud/speech';

interface ITask {
    title: string;
    description?: string;
    deadline?: string;
}

interface IMeetingDetails {
    date?: string;
    time?: string;
}

interface IAIResponse {
    summary: string;
    tasks: ITask[];
    meetingDetails: IMeetingDetails;
    keyPoints: string[];
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
const speechClient = new SpeechClient();

export const transcribeAudio = async (audioBuffer: Buffer): Promise<string> => {
    const audio = {
        content: audioBuffer.toString('base64'),
    };

    const config: protos.google.cloud.speech.v1.IRecognitionConfig = {
        encoding: protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.MP3,
        sampleRateHertz: 16000,
        languageCode: 'en-US',
    };

    const request: protos.google.cloud.speech.v1.IRecognizeRequest = {
        audio,
        config,
    };

    const [response] = await speechClient.recognize(request);
    return response.results?.map(result => result.alternatives?.[0].transcript).join(' ') || '';
};

export const processTranscript = async (transcript: string): Promise<IAIResponse> => {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
    Analyze the following meeting transcript and extract the following information. If a piece of information is not explicitly mentioned, indicate it as 'not specified' or leave it blank as appropriate in the JSON structure.

    1.  **Concise Summary:** Provide a brief summary of the meeting's main points and outcomes.
    2.  **Action Items/Tasks:** Identify all actionable tasks discussed. For each task, extract:
        -   **Title:** A short, action-oriented title.
        -   **Description:**  A more detailed explanation of the task if available. If not, use the relevant sentence from the transcript as description or leave blank if no description is naturally found.
        -   **Deadline:** Extract any mentioned deadlines or due dates for the task. If no deadline is mentioned, indicate as 'not specified'.
    3.  **Meeting Details:** Extract the date and time of the meeting if mentioned.
        -   **Date:** Extract the meeting date. If not mentioned, indicate 'not specified'.
        -   **Time:** Extract the meeting time. If not mentioned, indicate 'not specified'.
    4.  **Key Discussion Points:** Identify and list the key topics or discussion points from the meeting in bullet points or a numbered list.
    5, **Year** This is the year 2025. so keep this in mind while extracting the date and time. So if the date is mentioned as 5th of January, 2025, it should be extracted as 2025-01-05. Similarly, if the time is mentioned as 3:30 PM, it should be extracted as 15:30. Stricly adhere to this format. If in the transcript, the date is mentioned as lets say month only, then you can extract it as 2025-01-01. Similarly, if the time is mentioned as morning, you can extract it as 09:00 and if it is mentioned as evening, you can extract it as 18:00.

    Transcript:
    \`\`\`
    ${transcript}
    \`\`\`

    Format your response as a JSON object with the following structure:

    \`\`\`json
    {
      "summary": "meeting summary...",
      "tasks": [
        {
          "title": "Task title 1",
          "description": "Task description 1",
          "deadline": "Deadline for task 1 (YYYY-MM-DD format if date, HH:MM format if time, or 'not specified')"
        },
        {
          "title": "Task title 2",
          "description": "Task description 2",
          "deadline": "Deadline for task 2 (YYYY-MM-DD format if date, HH:MM format if time, or 'not specified')"
        },
        ...
      ],
      "meetingDetails": {
        "date": "Meeting date (YYYY-MM-DD format or 'not specified')",
        "time": "Meeting time (HH:MM format or 'not specified')"
      },
      "keyPoints": [
        "Key point 1",
        "Key point 2",
        ...
      ]
    }
    \`\`\`

    Ensure the JSON response is parsable and strictly adheres to the format above. For deadlines, dates and times, try to format them in 'YYYY-MM-DD' and 'HH:MM' format respectively when possible, otherwise return the extracted text or 'not specified'.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();

    text = text.replace(/`(json)?\n?/g, '').replace(/`/g, '');

    try {
        const parsedResponse = JSON.parse(text) as IAIResponse;
        return parsedResponse;
    } catch (error) {
        console.error('Error parsing AI response JSON:', error);
        console.error('AI Response Text (for debugging):', text); // Log the raw response text
        return {
            summary: "Error parsing AI response. Please check logs for details.",
            tasks: [],
            meetingDetails: { date: 'not specified', time: 'not specified' },
            keyPoints: ["Error in processing transcript - JSON parse failed."]
        };
    }
};