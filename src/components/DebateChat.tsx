import {
  Accessor,
  createEffect,
  createSignal,
  Index,
  onMount,
  Show,
} from 'solid-js';
import { createStore } from 'solid-js/store';
import { getCompletionStream, initOpenAiSDK } from '~/utils/api';
import styles from './DebateChat.module.css';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DRAW_LENGTH = 20; // Max turns, call it a draw after this

export interface DebateChatProps {
  apiKey: string;
  debateTopics: {
    a: string;
    b: string;
  };
  onReset: () => void;
}

export default function DebateChat(props: DebateChatProps) {
  const [winner, setWinner] = createSignal('');
  let turnRunning = false;
  const [turnCount, setTurnCount] = createSignal(2);

  const [state, setState] = createStore<{
    conversation: Array<{ name: 'a' | 'b'; utterance: string }>;
  }>({
    conversation: [
      {
        name: 'a',
        utterance: props.debateTopics.a,
      },
      {
        name: 'b',
        utterance: props.debateTopics.b,
      },
    ],
  });

  const handleTurn = async () => {
    const agentId = turnCount() % 2 === 0 ? 'a' : 'b';
    const contextLen = state.conversation.length;
    const nextIdx = contextLen;

    if (turnRunning) {
      return;
    }

    turnRunning = true;

    const stream = await getCompletionStream(
      agentId,
      props.debateTopics[agentId],
      state.conversation
    );

    setState('conversation', nextIdx, {
      name: agentId,
      utterance: '',
    });

    for await (const part of stream) {
      const prev = state.conversation[nextIdx].utterance;
      const delta = part.choices[0]?.delta?.content || '';
      setState('conversation', nextIdx, 'utterance', `${prev}${delta}`);
    }

    turnRunning = false;
    setTurnCount(turnCount() + 1);
  };

  onMount(() => {
    initOpenAiSDK(props.apiKey);
    handleTurn();
  });

  // Turns are handled by a cycle of side-effect handlers observing primarily the turnCount
  createEffect(async () => {
    if (
      state.conversation[state.conversation.length - 1].utterance.includes(
        'I concede'
      )
    ) {
      setWinner(
        state.conversation[state.conversation.length - 1].name === 'a'
          ? 'b'
          : 'a'
      );

      await handleTurn(); // Allow the final "thank you" from the winning agent
    } else if (turnCount() >= DRAW_LENGTH) {
      setWinner('draw');
    } else if (!winner()) {
      // Emulate a little bit of consideration time
      await sleep(Math.random() * 2000);
      // Handle all subsequent turns (first run is called onMount)
      await handleTurn();
    }
  });

  return (
    <div class={styles.container}>
      <Index each={state.conversation}>
        {(c: Accessor<{ name: 'a' | 'b'; utterance: string }>, i) => (
          <div class={styles.agent_utterance}>
            <span>Agent {c().name}</span>
            {c().utterance}
          </div>
        )}
      </Index>
      <Show when={winner()}>
        <div class={styles.result}>
          <h2>Result</h2>
          <h3>
            {winner() === 'draw'
              ? 'Seems to be a draw!'
              : `Agent ${winner()} has bested their opponent.`}
          </h3>
          <button onClick={() => props.onReset()}>Play Again</button>
        </div>
      </Show>
    </div>
  );
}
