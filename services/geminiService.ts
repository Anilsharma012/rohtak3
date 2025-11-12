// services/geminiService.ts
// Safe NO-OP shim: no API key required, no runtime crash.
// Later if you want real Gemini, I’ll swap this back to the real client.

export const editImageWithPrompt = async (
  base64ImageData: string,
  _mimeType: string,
  _prompt: string
): Promise<string> => {
  // Gemini disabled: just return the original image so the app keeps working.
  console.warn("[geminiService] Disabled: no API key configured. Returning original image.");
  return base64ImageData;
};
