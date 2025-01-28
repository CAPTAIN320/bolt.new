import { streamText as _streamText, convertToCoreMessages } from 'ai';
import { getAPIKey } from '~/lib/.server/llm/api-key';
import { MAX_TOKENS } from './constants';
import { getSystemPrompt } from './prompts';

import { createAnthropic } from '@ai-sdk/anthropic';
import { createAzure } from '@ai-sdk/azure';

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
    });

    return _streamText({
      model: azure('gpt-4o'),
      // model: azure('gpt-4o-2024-08-06'),
      system: getSystemPrompt(),
      messages: convertToCoreMessages(messages),
      maxTokens: 4096,
      ...options,
    });

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
