// Bytez API Client - One API for everything!
// Chat, Image Gen, TTS, STT, Code Execution, and more!

const BYTEZ_API_KEY = import.meta.env?.VITE_BYTEZ_API_KEY || 
                      (typeof process !== 'undefined' && process.env?.VITE_BYTEZ_API_KEY) || 
                      '';

const BYTEZ_BASE_URL = 'https://api.bytez.com/v1';

if (!BYTEZ_API_KEY) {
  console.error('Missing Bytez API key! Make sure VITE_BYTEZ_API_KEY is set.');
}

export class BytezClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || BYTEZ_API_KEY;
  }

  // Chat completion (like ChatGPT)
  async chat(messages: Array<{ role: string; content: string }>, options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  }) {
    console.log('[Bytez] Chat request:', { messages: messages.length, options });
    
    const response = await fetch(`${BYTEZ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model || 'gpt-4',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.max_tokens || 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Bytez] Chat error:', error);
      throw new Error(`Bytez chat failed: ${error}`);
    }

    const data = await response.json();
    console.log('[Bytez] Chat response received');
    return data;
  }

  // Stream chat (for real-time responses)
  async chatStream(messages: Array<{ role: string; content: string }>, 
    onChunk: (text: string) => void,
    options?: {
      model?: string;
      temperature?: number;
    }
  ) {
    console.log('[Bytez] Chat stream request');
    
    const response = await fetch(`${BYTEZ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model || 'gpt-4',
        messages,
        temperature: options?.temperature || 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error('Bytez stream failed');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No reader available');
    }

    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          
          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    }
  }

  // Generate image
  async generateImage(prompt: string, options?: {
    size?: string;
    model?: string;
    n?: number;
  }) {
    console.log('[Bytez] Image generation request:', prompt);
    
    const response = await fetch(`${BYTEZ_BASE_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        prompt,
        size: options?.size || '1024x1024',
        model: options?.model || 'dall-e-3',
        n: options?.n || 1,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Bytez] Image generation error:', error);
      throw new Error(`Image generation failed: ${error}`);
    }

    const data = await response.json();
    console.log('[Bytez] Image generated successfully');
    return data;
  }

  // Text to speech
  async textToSpeech(text: string, options?: {
    voice?: string;
    model?: string;
  }) {
    console.log('[Bytez] TTS request');
    
    const response = await fetch(`${BYTEZ_BASE_URL}/audio/speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        input: text,
        voice: options?.voice || 'alloy',
        model: options?.model || 'tts-1',
      }),
    });

    if (!response.ok) {
      throw new Error('TTS failed');
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  }

  // Speech to text
  async speechToText(audioBlob: Blob, options?: {
    language?: string;
    model?: string;
  }) {
    console.log('[Bytez] STT request');
    
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', options?.model || 'whisper-1');
    if (options?.language) {
      formData.append('language', options.language);
    }

    const response = await fetch(`${BYTEZ_BASE_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('STT failed');
    }

    const data = await response.json();
    return data.text;
  }

  // Execute code (Python, JavaScript, etc.)
  async executeCode(code: string, language: string = 'python') {
    console.log('[Bytez] Code execution request');
    
    const response = await fetch(`${BYTEZ_BASE_URL}/code/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        code,
        language,
      }),
    });

    if (!response.ok) {
      throw new Error('Code execution failed');
    }

    return await response.json();
  }
}

// Singleton instance
export const bytez = new BytezClient();

export default bytez;
