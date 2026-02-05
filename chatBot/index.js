import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import voice from "elevenlabs-node";
import express from "express";
import { promises as fs, existsSync, mkdirSync } from "fs"; // Added sync checks
import Groq from "groq-sdk/index.mjs";
import path from "path";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = "P3JECz9WQeXyyodBL3ZD"; // Ensure this ID is valid in your ElevenLabs dashboard

const app = express();
app.use(express.json());
app.use(cors());
const port = 8080;

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
    // Using relative paths to the root 'audios' folder
    await execCommand(
      `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav`
    );

    console.log(`Conversion done in ${new Date().getTime() - time}ms`);

    // Use .exe extension for Windows
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
  console.log("Received message from frontend:", userMessage);

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];


  try {
    const response = await fetch("https://hackvision-2026-agritech.onrender.com/api/chat", {
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

      // Always initialize these
      message.audio = null;
      message.lipsync = null;

      try {
        // 1. Generate Speech
        await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, message.text);

        // 2. Read audio file (independent of lipsync)
        message.audio = await audioFileToBase64(fileName);
        console.log(`✓ Audio generated for message ${i}`);
      } catch (err) {
        console.error(`✗ Error generating audio for message ${i}:`, err.message);
      }

      // 3. Generate LipSync (independent of audio)
      try {
        const lipsyncSuccess = await lipSyncMessage(i);
        if (lipsyncSuccess) {
          message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
          console.log(`✓ Lipsync generated for message ${i}`);
        }
      } catch (err) {
        console.error(`✗ Error generating lipsync for message ${i}:`, err.message);
      }
    }

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

app.listen(port, () => {
  console.log(`Virtual Girlfriend listening on port ${port}`);
});