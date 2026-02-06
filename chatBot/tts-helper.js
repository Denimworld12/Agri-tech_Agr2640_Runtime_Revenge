import gtts from "gtts";

// FREE Google Text-to-Speech function
export const generateAudioWithGTTS = async (text, fileName, languageCode = "en-IN") => {
    try {
        // Map our language codes to gTTS language codes
        const gttsLanguageMap = {
            "en-IN": "en",
            "en-US": "en",
            "hi-IN": "hi",
            "mr-IN": "mr",
            "ta-IN": "ta",
            "te-IN": "te",
            "bn-IN": "bn",
            "gu-IN": "gu",
            "kn-IN": "kn",
            "ml-IN": "ml",
            "pa-IN": "pa"
        };

        const gttsLang = gttsLanguageMap[languageCode] || "en";
        console.log(`🔄 Using FREE Google TTS (Language: ${gttsLang})...`);

        return new Promise((resolve, reject) => {
            const speech = new gtts(text, gttsLang);

            speech.save(fileName, (err) => {
                if (err) {
                    console.error(`✗ gTTS error:`, err.message);
                    reject(err);
                } else {
                    console.log(`✓ FREE Google TTS audio generated in ${gttsLang}: ${fileName}`);
                    resolve(true);
                }
            });
        });
    } catch (error) {
        console.error(`✗ gTTS error:`, error.message);
        return false;
    }
};
