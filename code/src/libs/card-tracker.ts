import * as audio from "./audio";

type CardId = string;

interface CardDiscovery {
  id: CardId;
  scene: string;
  timestamp: number;
}

interface CardTrackerState {
  discoveries: Map<CardId, CardDiscovery>;
}

const state: CardTrackerState = {
  discoveries: new Map(),
};

export const discover = (cardId: CardId, scene: string): boolean => {
  if (state.discoveries.has(cardId)) {
    return false;
  }

  state.discoveries.set(cardId, {
    id: cardId,
    scene,
    timestamp: Date.now(),
  });

  audio.drawCard.start();

  return true;
};

export const isDiscovered = (cardId: CardId): boolean => {
  return state.discoveries.has(cardId);
};

export const getCount = (): number => {
  return state.discoveries.size;
};

export const getAll = (): CardDiscovery[] => {
  return Array.from(state.discoveries.values());
};

export const getByScene = (scene: string): CardDiscovery[] => {
  return Array.from(state.discoveries.values()).filter(
    (discovery) => discovery.scene === scene
  );
};

export const getCountByScene = (scene: string): number => {
  return getByScene(scene).length;
};

export const reset = (): void => {
  state.discoveries.clear();
};

export const exportData = (): Record<string, CardDiscovery> => {
  const data: Record<string, CardDiscovery> = {};
  state.discoveries.forEach((discovery, id) => {
    data[id] = discovery;
  });
  return data;
};

export const importData = (data: Record<string, CardDiscovery>): void => {
  state.discoveries.clear();
  Object.entries(data).forEach(([id, discovery]) => {
    state.discoveries.set(id, discovery);
  });
};
