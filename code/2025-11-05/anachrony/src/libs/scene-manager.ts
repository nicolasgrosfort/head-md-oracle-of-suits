export type Scene = {
  setup: () => Promise<void>;
  draw: () => void;
  cleanup: () => void;
};

type SceneName = "itr" | "mmk" | "emd" | "jkr" | "acn" | "sby" | "jpn";

let currentScene: Scene | null = null;
let currentSceneName: SceneName | null = null;
let scenes: Map<SceneName, Scene> = new Map();
let isSceneReady: boolean = false;

export const addScene = (name: SceneName, scene: Scene) => {
  scenes.set(name, scene);
};

export const switchTo = async (name: SceneName) => {
  const nextScene = scenes.get(name);
  isSceneReady = false;

  if (!nextScene) {
    console.error(`Scene "${name}" not found`);
    return;
  }

  if (currentScene) {
    currentScene.cleanup();
  }

  currentSceneName = name;

  currentScene = nextScene;
  await currentScene.setup();

  isSceneReady = true;

  console.log(`Switched to scene "${name}"`);
};

export const draw = () => {
  if (currentScene && isSceneReady) {
    currentScene.draw();
  }
};

export const sceneIsReady = (): boolean => {
  return isSceneReady;
};

export const getCurrentSceneName = (): SceneName | null => {
  return currentSceneName;
};
