export type StyleOption = {
  id: string;
  name: string;
  description: string;
};

export type GenerationRequest = {
  imageDataUrl: string;
  prompt: string;
  style: string;
};

export type GenerationResponse = {
  id: string;
  imageUrl: string;
  prompt: string;
  style: string;
  createdAt: string;
};

export type GenerationError = {
  message: string;
};

export type HistoryItem = GenerationResponse;