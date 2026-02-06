import {
  CameraControls,
  ContactShadows,
  Environment,
  Text,
} from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { useChat } from "../../hooks/useChat";
import { Avatar } from "./Avatar";
import { useThree } from "@react-three/fiber";
import { useMemo } from "react";
const Dots = (props) => {
  const { loading } = useChat();
  const [loadingText, setLoadingText] = useState("");
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingText((loadingText) => {
          if (loadingText.length > 2) {
            return ".";
          }
          return loadingText + ".";
        });
      }, 800);
      return () => clearInterval(interval);
    } else {
      setLoadingText("");
    }
  }, [loading]);
  if (!loading) return null;
  return (
    <group {...props}>
      <Text
        fontSize={0.14}
        anchorX={"left"}
        anchorY={"bottom"}
      >
        {loadingText}
        <meshBasicMaterial attach="material" color="black" />
      </Text>
    </group>
  );
};


const LyricsDisplay = (props) => {
  const { message } = useChat();
  const { viewport } = useThree(); // Access the 3D viewport dimensions

  const [currentText, setCurrentText] = useState("");
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Responsive maxWidth calculation
  // We take 80% of the viewport width, but cap it at a reasonable max (e.g., 3 units)
  const responsiveMaxWidth = useMemo(() => {
    return Math.min(viewport.width * 0.8, 3);
  }, [viewport.width]);

  useEffect(() => {
    if (message && message.text) {
      const wordArray = message.text.split(" ");
      setWords(wordArray);
      setCurrentWordIndex(0);
      setCurrentText("");
    } else {
      setWords([]);
      setCurrentText("");
      setCurrentWordIndex(0);
    }
  }, [message]);

  useEffect(() => {
    if (words.length === 0) return;

    const totalDuration = message?.audioDuration || 5000;
    const intervalTime = totalDuration / words.length;

    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => {
        if (prevIndex >= words.length - 1) {
          clearInterval(interval);
          return prevIndex;
        }
        return prevIndex + 1;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [words, message]);

  useEffect(() => {
    if (currentWordIndex < words.length) {
      setCurrentText(words.slice(0, currentWordIndex + 1).join(" "));
    }
  }, [currentWordIndex, words]);

  if (!message || !currentText) return null;

  const maxCharsPerLine = 25;
  const lines = [];
  let currentLine = "";

  currentText.split(" ").forEach((word) => {
    if ((currentLine + " " + word).length > maxCharsPerLine && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = currentLine ? currentLine + " " + word : word;
    }
  });
  if (currentLine) lines.push(currentLine);

  const displayLines = lines.slice(-3);

  return (
    <group {...props}>
      {displayLines.map((line, index) => (
        <Text
          key={index}
          fontSize={0.14}
          anchorX={"center"}
          anchorY={"top"}
          position-y={-index * 0.16}
          maxWidth={responsiveMaxWidth}
          textAlign="center"
        >
          {line}
          <meshBasicMaterial attach="material" color="black" />
        </Text>
      ))}
    </group>
  );
};
export const Experience = () => {
  const cameraControls = useRef();
  const { cameraZoomed } = useChat();

  useEffect(() => {
    cameraControls.current.setLookAt(0, 2, 5, 0, 1.5, 0);
  }, []);

  useEffect(() => {
    if (cameraZoomed) {
      cameraControls.current.setLookAt(0, 1.5, 2.2, 0, 1.5, 0, true);
    } else {
      cameraControls.current.setLookAt(0, 2.2, 5, 0, 1.0, 0, true);
    }
  }, [cameraZoomed]);

  return (
    <>
      <CameraControls ref={cameraControls} />
      <Environment preset="sunset" />

      {/* Wrapping Dots into Suspense to prevent Blink when Troika/Font is loaded */}
      <Suspense>
        <Dots position-y={1.75} position-x={-0.02} />
      </Suspense>

      {/* Lyrics Display centered at top */}
      <Suspense>
        <LyricsDisplay position={[-0.0, 2.15, -1]} />
      </Suspense>

      <Avatar />
      <ContactShadows opacity={0.7} />
    </>
  );
};