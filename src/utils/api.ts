/*
 * OpenAI API layer
 */
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';


let openai: OpenAI;

export const initOpenAiSDK = (apiKey: string) => {
  if (!apiKey || !apiKey.trim().length) throw new Error('API key is required to initialize OpenAI SDK');

  openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  });
}


export const getCompletionStream = async (agentId: 'a'|'b', agentArgument: string, conversationContext: { name: 'a' | 'b'; utterance: string }[]) => {
  if (!openai) throw new Error('Initialize OpenAI SDK prior to calling APIs');

  const debateContext =  conversationContext.map((c: { name: 'a' | 'b'; utterance: string }, i: number) => ({ 
    role: agentId === c.name ? 'assistant' : 'user', 
    name: c.name,
    content: c.utterance 
  } as ChatCompletionMessageParam))

  const stream = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `You are in a civilized debate with the user. You are arguing in favor of the following statement: ${agentArgument}. Keep responses succinct, less than 100 characters. Try to refute or respond to the very last message sent by the user, but consider all points made by both sides. If you feel convinced by the user's argument you may reply with the literal string "I concede".`
      },
      ...debateContext
    ],
    max_tokens: 100,
    stream: true,
  });

  return stream;
}

