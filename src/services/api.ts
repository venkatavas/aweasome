import type { GenerationRequest, GenerationResponse, GenerationError } from '../types';

// Simulated API delay (1-2 seconds)
const getRandomDelay = () => Math.floor(Math.random() * 1000) + 1000;

// 20% chance of error
const shouldError = () => Math.random() < 0.2;

// Generate a unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Controller for aborting requests
let controller: AbortController | null = null;

export const generateImage = async (
  request: GenerationRequest
): Promise<GenerationResponse> => {
  // Create a new AbortController for this request
  controller = new AbortController();
  const signal = controller.signal;

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      if (shouldError()) {
        reject({ message: 'Model overloaded' } as GenerationError);
      } else {
        // Return the same image that was uploaded as the "generated" image
        // In a real app, this would be a new image from the AI model
        resolve({
          id: generateId(),
          imageUrl: request.imageDataUrl,
          prompt: request.prompt,
          style: request.style,
          createdAt: new Date().toISOString(),
        });
      }
    }, getRandomDelay());

    // If the request is aborted, clear the timeout and reject
    signal.addEventListener('abort', () => {
      clearTimeout(timeoutId);
      reject({ message: 'Request aborted' } as GenerationError);
    });
  });
};

export const abortRequest = (): void => {
  if (controller) {
    controller.abort();
    controller = null;
  }
};

// Predefined style options
export const styleOptions = [
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Clean, professional look suitable for publications',
  },
  {
    id: 'streetwear',
    name: 'Streetwear',
    description: 'Urban, casual style with bold elements',
  },
  {
    id: 'vintage',
    name: 'Vintage',
    description: 'Classic, retro aesthetic with nostalgic elements',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Simple, clean design with essential elements only',
  },
  {
    id: 'futuristic',
    name: 'Futuristic',
    description: 'Forward-looking style with innovative elements',
  },
];