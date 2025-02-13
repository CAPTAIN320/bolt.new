import { streamText as _streamText, convertToCoreMessages } from 'ai';
import { getAPIKey } from '~/lib/.server/llm/api-key';
import { MAX_TOKENS } from './constants';
import { getSystemPrompt } from './prompts';

import { createAnthropic } from '@ai-sdk/anthropic';
import { createAzure } from '@ai-sdk/azure';
import { createOllama } from 'ollama-ai-provider';

interface ToolResult<Name extends string, Args, Result> {
  toolCallId: string;
  toolName: Name;
  args: Args;
  result: Result;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolResult<string, unknown, unknown>[];
}

export type Messages = Message[];

export type StreamingOptions = Omit<Parameters<typeof _streamText>[0], 'model'>;

export function streamText(messages: Messages, env: Env, options?: StreamingOptions) {
  try {
    const azureResourceName = process.env.AZURE_RESOURCE_NAME;
    const azureResourceNameApiKey = process.env.AZURE_RESOURCE_NAME_API_KEY;
    const azure = createAzure({
      resourceName: azureResourceName,
      apiKey: azureResourceNameApiKey,
      headers: {
        api_version: '2024-11-20',
      },
    });

    // `
    //   For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.
    //   By default, this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.
    //   Use icons from lucide-react for logos.
    //   Use stock photos from unsplash where appropriate, only valid URLs you know exist. Do not download the images, only link to them in image tags.
    // `;

    return _streamText({
      // model: azure('gpt-4o'),
      model: azure('gpt-4o-2'),
      system: getSystemPrompt(),
      messages: convertToCoreMessages(messages),
      maxTokens: 8192,
      ...options,
    });

    // const ollama = createOllama({
    //   baseURL: 'http://localhost:11434/api',
    // });

    // return _streamText({
    //   // model: ollama('llava'),
    //   // model: ollama('deepseek-r1:7b'),
    //   model: ollama('deepseek-r1:70b'),
    //   system: getSystemPrompt(),
    //   messages: convertToCoreMessages(messages),
    //   maxTokens: MAX_TOKENS,
    //   ...options,
    // });

    // const anthropic = createAnthropic({
    //   apiKey: getAPIKey(env),
    // });

    // return _streamText({
    //   model: anthropic('claude-3-5-sonnet-20240620'),
    //   system: getSystemPrompt(),
    //   maxTokens: MAX_TOKENS,
    //   headers: {
    //     'anthropic-beta': 'max-tokens-3-5-sonnet-2024-07-15',
    //   },
    //   messages: convertToCoreMessages(messages),
    //   ...options,
    // });
  } catch (error) {
    console.error('Error streaming text:', error);
    throw error;
  }
}
