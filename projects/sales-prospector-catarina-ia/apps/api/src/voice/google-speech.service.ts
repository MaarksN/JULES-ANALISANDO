import { SpeechClient } from "@google-cloud/speech";
import textToSpeech from "@google-cloud/text-to-speech";

// STT
const client = new SpeechClient();

export async function streamSTT(stream: any) {
  const request = {
    config: {
      encoding: "LINEAR16" as const,
      sampleRateHertz: 16000,
      languageCode: "pt-BR",
    },
    interimResults: true,
  };

  const recognizeStream = client
    .streamingRecognize(request)
    .on("data", (data: any) => {
      if (data.results[0]?.alternatives[0]) {
        console.log(data.results[0].alternatives[0].transcript);
      }
    });

  // Backpressure management
  recognizeStream.on("drain", () => stream.resume());
  stream.on("data", (chunk: any) => {
    if (!recognizeStream.write(chunk)) {
      stream.pause();
    }
  });
}

// TTS
const ttsClient = new textToSpeech.TextToSpeechClient();

// Mock Azure Fallback
async function azureTTS(text: string) {
  console.log("Fallback to Azure TTS", text);
  return Buffer.from("mock-audio-content");
}

export async function synthesize(text: string, lang: string = "pt-BR") {
  try {
    const [response] = await ttsClient.synthesizeSpeech({
      input: { text },
      voice: { languageCode: lang, ssmlGender: "FEMALE" },
      audioConfig: { audioEncoding: "MP3" },
    });
    return response.audioContent;
  } catch (error) {
    console.error("Google TTS failed, trying fallback", error);
    return await azureTTS(text);
  }
}
