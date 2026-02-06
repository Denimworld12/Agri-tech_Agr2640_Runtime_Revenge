import gtts from "gtts";

// FREE Google Text-to-Speech function
export const generateAudioWithGTTS = async (text, fileName) => {
    try {
        console.log(`🔄 Using FREE Google TTS...`);

        return new Promise((resolve, reject) => {
            const speech = new gtts(text, 'en');

            speech.save(fileName, (err) => {
                if (err) {
                    console.error(`✗ gTTS error:`, err.message);
                    reject(err);
                } else {
                    console.log(`✓ FREE Google TTS audio generated: ${fileName}`);
                    resolve(true);
                }
            });
        });
    } catch (error) {
        console.error(`✗ gTTS error:`, error.message);
        return false;
    }
};
