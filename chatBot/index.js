import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { promises as fs, existsSync, mkdirSync } from "fs";
import Groq from "groq-sdk/index.mjs";
import gtts from "gtts";
import path from "path";
import { generateAudioWithGTTS } from "./tts-helper.js";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = "1Z7Y8o9cvUeWq8oLKgMY";

const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 8765;

// Ensure audios directory exists at startup
const audioFolder = path.join(process.cwd(), "audios");
if (!existsSync(audioFolder)) {
  mkdirSync(audioFolder);
  console.log("Created 'audios' directory");
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Command execution error: ${stderr}`);
        reject(error);
      }
      resolve(stdout);
    });
  });
};

const lipSyncMessage = async (message) => {
  const time = new Date().getTime();
  console.log(`Starting conversion for message ${message}`);

  try {
    await execCommand(
      `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav`
    );

    console.log(`Conversion done in ${new Date().getTime() - time}ms`);

    const rhubarbCmd = process.platform === 'win32'
      ? `.\\bin\\rhubarb.exe`
      : `./bin/rhubarb`;

    await execCommand(
      `${rhubarbCmd} -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`
    );

    console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
    return true;
  } catch (error) {
    console.error(`Lipsync generation failed for message ${message}:`, error.message);
    return false;
  }
};

const cleanupAudioFiles = async () => {
  try {
    const files = await fs.readdir(audioFolder);
    const audioFiles = files.filter(file =>
      file.startsWith('message_') && (file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.json'))
    );

    for (const file of audioFiles) {
      await fs.unlink(path.join(audioFolder, file));
    }
    console.log(`Cleaned up ${audioFiles.length} old audio files`);
  } catch (error) {
    console.error('Error cleaning up audio files:', error.message);
  }
};

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!elevenLabsApiKey || !process.env.GROQ_API_KEY) {
    res.send({
      messages: [
        {
          text: "Please my dear, don't forget to add your API keys!",
          facialExpression: "angry",
          animation: "Angry",
        },
      ],
    });
    return;
  }

  await cleanupAudioFiles();

  console.log("Received message from frontend:", userMessage);

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  try {
    const response = await fetch("http://localhost:8000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: userMessage,
        language: "en",
        location: "Mumbai"
      }),
    });

    const data = await response.json();
    console.log("Received data from backend API:", JSON.stringify(data));

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1000,
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You are a response formatter and agricultural assistant.

CRITICAL RULES:
1. The user content is VERIFIED and AUTHORITATIVE agricultural data.
2. You MUST preserve all technical facts.
3. Any location-specific reference (such as Kerala, districts, or local state mentions)
   must be generalized to a PAN-INDIA context unless the user explicitly specifies a state.

LOCATION NORMALIZATION RULE:
- If any response mentions a specific Indian state (e.g., Kerala),
  rewrite it to apply generally across India.
- Use phrases like:
  "across India", "in most Indian farming regions", "depending on your local climate and soil",
  "based on regional conditions in India".

You are NOT allowed to:
- Introduce new locations
- Hallucinate state-specific data
- Lock advice to one region unless explicitly provided

OUTPUT FORMAT:
Always reply using JSON with a "messages" array (max 3 messages).
Each message must contain:
- text
- facialExpression
- animation

STYLE:
- Professional
- Simple for farmers
- Practical
- Actionable

AVAILABLE VISUALS:
- facialExpressions: smile, sad, angry, surprised, funnyFace, default
- animations: Talking_0, Talking_1, Talking_2, Idle
`
        },
        {
          role: "user",
          content: JSON.stringify(data) || "Hello",
        },
      ],
    });

    let content = completion.choices[0]?.message?.content;
    let parsedContent = JSON.parse(content);
    let messages = parsedContent.messages || parsedContent;

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const fileName = `audios/message_${i}.mp3`;
      const wavFileName = `audios/message_${i}.wav`;
      const jsonFileName = `audios/message_${i}.json`;

      message.audio = null;
      message.lipsync = null;

      try {
        // Delete existing files if they exist
        try {
          await fs.unlink(fileName);
          console.log(`Deleted old file: ${fileName}`);
        } catch (err) {
          // File doesn't exist, that's fine
        }

        // Generate Speech using ElevenLabs
        console.log(`\n=== Generating audio for message ${i} ===`);
        console.log(`Text: "${message.text.substring(0, 100)}..."`);
        console.log(`API Key present: ${!!elevenLabsApiKey}`);
        console.log(`Voice ID: ${voiceID}`);
        console.log(`Output file: ${fileName}`);

        try {
          // Direct ElevenLabs API call (FIXED VERSION)
          console.log(`Calling ElevenLabs API...`);
          const elevenLabsResponse = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceID}`,
            {
              method: 'POST',
              headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': elevenLabsApiKey,
              },
              body: JSON.stringify({
                text: message.text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                  stability: 0.5,
                  similarity_boost: 0.75,
                },
              }),
            }
          );

          console.log(`ElevenLabs API response status: ${elevenLabsResponse.status}`);

          if (!elevenLabsResponse.ok) {
            const errorData = await elevenLabsResponse.json().catch(() => ({}));
            console.error(`✗ ElevenLabs API Error ${elevenLabsResponse.status}:`, errorData);
            
            if (elevenLabsResponse.status === 402) {
              console.error(`Your ElevenLabs account has run out of credits.`);
              throw new Error('ElevenLabs API: Payment Required - Out of credits');
            }
            if (elevenLabsResponse.status === 422) {
              console.error(`ElevenLabs API: Invalid parameters`);
              throw new Error('ElevenLabs API: Invalid parameters (422)');
            }
            throw new Error(`ElevenLabs API error: ${elevenLabsResponse.status}`);
          }

          // Get the audio buffer
          const audioBuffer = await elevenLabsResponse.arrayBuffer();
          
          // Write to file
          await fs.writeFile(fileName, Buffer.from(audioBuffer));
          console.log(`✓ ElevenLabs audio file created: ${fileName} (${audioBuffer.byteLength} bytes)`);

        } catch (apiError) {
          console.error(`✗ ElevenLabs API error for message ${i}:`, apiError.message);

          // Fallback to Google TTS
          console.log(`\n⚠️  Trying FREE Google TTS fallback...\n`);
          
          try {
            const success = await generateAudioWithGTTS(message.text, fileName);
            if (!success) {
              throw new Error('Google TTS fallback failed');
            }
            console.log(`✓ Google TTS fallback successful`);
          } catch (fallbackError) {
            console.error(`✗ Google TTS fallback failed:`, fallbackError.message);
            throw new Error('Both ElevenLabs and Google TTS failed');
          }
        }

        // Verify file was created
        try {
          const stats = await fs.stat(fileName);
          console.log(`✓ Audio file verified: ${fileName} (${stats.size} bytes)`);
          
          // Read audio file and convert to base64
          message.audio = await audioFileToBase64(fileName);
          console.log(`✓ Audio converted to base64 for message ${i}`);
        } catch (statError) {
          console.error(`✗ File not found: ${fileName}`, statError.message);
          throw new Error(`Audio file was not created: ${fileName}`);
        }

      } catch (err) {
        console.error(`✗ Error generating audio for message ${i}:`, err.message);
        console.error(`Full error:`, err);
      }

      // Generate LipSync (independent of audio)
      try {
        const lipsyncSuccess = await lipSyncMessage(i);
        if (lipsyncSuccess) {
          message.lipsync = await readJsonTranscript(jsonFileName);
          console.log(`✓ Lipsync generated for message ${i}`);
        }
      } catch (err) {
        console.error(`✗ Error generating lipsync for message ${i}:`, err.message);
      }
    }

    console.log(`\n✓ All messages processed. Sending response...`);
    res.send({ messages });
  } catch (error) {
    console.error("Groq/Server Error:", error);
    res.status(500).send("Error generating response");
  }
});

const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};

const server = app.listen(port, () => {
  console.log(`✓ Chatbot server listening on port ${port}`);
  console.log(`✓ Server ready at http://localhost:${port}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`✗ Port ${port} is already in use`);
    console.log(`Trying alternative port...`);
    const altPort = port + 1;
    app.listen(altPort, () => {
      console.log(`✓ Chatbot server listening on port ${altPort}`);
      console.log(`✓ Server ready at http://localhost:${altPort}`);
    });
  } else {
    console.error('✗ Server error:', err);
  }
});