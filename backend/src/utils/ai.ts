import { GoogleGenerativeAI } from '@google/generative-ai';
import { SpeechClient } from '@google-cloud/speech';
import { protos } from '@google-cloud/speech';

interface ITask {
    title: string;
    description?: string;
    deadline?: string;
}

interface IAIResponse {
    summary: string;
    tasks: ITask[];
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
        languageCode: 'en-IN',
    };

    const request: protos.google.cloud.speech.v1.IRecognizeRequest = {
        audio,
        config,
    };

    const [response] = await speechClient.recognize(request);
    return response.results?.map(result => result.alternatives?.[0].transcript).join(' ') || '';
};

export const processTranscript = async (transcript: string): Promise<IAIResponse> => {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
    Analyze this meeting transcript and provide:
    1. A concise summary
    2. A list of action items/tasks with deadlines if mentioned
    
    Transcript:
    ${transcript}
    
    Format the response as JSON with "summary" and "tasks" fields.
    Each task should have: title, description, and deadline (if mentioned).
  `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    try {
        return JSON.parse(text) as IAIResponse;
    } catch (error) {
        console.error('Error parsing AI response:', error);
        return {
            summary: text || "An error occurred while processing the transcript",
            tasks: []
        };
    }
};