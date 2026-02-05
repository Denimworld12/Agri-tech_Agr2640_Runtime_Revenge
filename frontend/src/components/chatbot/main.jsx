import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from ".//Experience";
import { UI } from "./UI";

function MainChatbot() {
  return (
    <>
     <div data-theme="lemonade" className="h-screen w-full overflow-hidden bg-base-200">
      <Loader />
      <Leva hidden />
      <UI />
      {/* 3D Scene Layer */}
      <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }} className="z-0">
        <Experience />
      </Canvas>
    </div>
    </>
  );
}

export default MainChatbot;