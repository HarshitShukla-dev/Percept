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
        -   **Deadline:** Extract any mentioned deadlines or due dates for the task. If no deadline is mentioned, use exactly "not specified". Use YYYY-MM-DD format for dates (e.g., 2025-01-05) and HH:MM format for times (e.g., 15:30).
    3.  **Meeting Details:** Extract the date and time of the meeting if mentioned.
        -   **Date:** Extract the meeting date in YYYY-MM-DD format. If not mentioned, use exactly "not specified".
        -   **Time:** Extract the meeting time in HH:MM format. If not mentioned, use exactly "not specified".
    4.  **Key Discussion Points:** Identify and list the key topics or discussion points from the meeting in bullet points or a numbered list.
    5.  **Year** This is the year 2025, so keep this in mind while extracting dates. If the date is mentioned as "5th of January", it should be extracted as "2025-01-05". Only use a specific date format if it's clearly mentioned; otherwise use "not specified".

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
          "deadline": "not specified"
        },
        {
          "title": "Task title 2",
          "description": "Task description 2",
          "deadline": "2025-01-05"
        },
        ...
      ],
      "meetingDetails": {
        "date": "2025-01-05",
        "time": "15:30"
      },
      "keyPoints": [
        "Key point 1",
        "Key point 2",
        ...
      ]
    }
    \`\`\`

    Important: For all deadline, date and time fields, only use one of two possible values:
    1. Exact YYYY-MM-DD format for dates and HH:MM format for times, if explicitly mentioned
    2. The exact string "not specified" if not mentioned
    Do not include any other formats or text in these fields.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();

    text = text.replace(/`(json)?\n?/g, '').replace(/`/g, '');

    try {
        const parsedResponse = JSON.parse(text) as IAIResponse;
        
        // Validate and sanitize date/time fields
        if (parsedResponse.meetingDetails) {
            if (parsedResponse.meetingDetails.date && 
                parsedResponse.meetingDetails.date !== 'not specified' && 
                !/^\d{4}-\d{2}-\d{2}$/.test(parsedResponse.meetingDetails.date)) {
                parsedResponse.meetingDetails.date = 'not specified';
            }
            
            if (parsedResponse.meetingDetails.time && 
                parsedResponse.meetingDetails.time !== 'not specified' && 
                !/^\d{2}:\d{2}$/.test(parsedResponse.meetingDetails.time)) {
                parsedResponse.meetingDetails.time = 'not specified';
            }
        }

        // Validate and sanitize task deadlines
        if (parsedResponse.tasks && Array.isArray(parsedResponse.tasks)) {
            parsedResponse.tasks = parsedResponse.tasks.map(task => {
                if (task.deadline && 
                    task.deadline !== 'not specified' && 
                    !/^\d{4}-\d{2}-\d{2}$/.test(task.deadline) && 
                    !/^\d{2}:\d{2}$/.test(task.deadline)) {
                    task.deadline = 'not specified';
                }
                return task;
            });
        }
        
        return parsedResponse;
    } catch (error) {
        console.error('Error parsing AI response JSON:', error);
        console.error('AI Response Text (for debugging):', text);
        return {
            summary: "Error parsing AI response. Please check logs for details.",
            tasks: [],
            meetingDetails: { date: 'not specified', time: 'not specified' },
            keyPoints: ["Error in processing transcript - JSON parse failed."]
        };
    }
};