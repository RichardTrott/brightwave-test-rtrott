import { createSignal, Match, onMount, Show, Switch } from 'solid-js';
import DebateChat from '~/components/DebateChat';
import { initOpenAiSDK } from '~/utils/api';
import {
  clearSecret,
  hasSecret,
  retrieveSecret,
  storeSecret,
} from '~/utils/crypto';
import { isValidOpenAIKey } from '~/utils/validation';
import styles from './index.module.css';

enum PHASES {
  KEY_ENTRY = 'key_entry',
  PASSPHRASE_ENTRY = 'passphrase_entry',
  TOPIC_ENTRY = 'topic_entry',
  DEBATE = 'debate',
}

export default function Home() {
  const [phase, setPhase] = createSignal<PHASES>(PHASES.KEY_ENTRY);
  const [persistKey, setPersistKey] = createSignal(false);
  const [error, setError] = createSignal<null | Error>(null);
  const [apiKey, setApiKey] = createSignal('');
  const [passphrase, setPassphrase] = createSignal('');
  const [passphraseInput, setPassphraseInput] = createSignal('');
  const [debateTopicA, setDebateTopicA] = createSignal('');
  const [debateTopicB, setDebateTopicB] = createSignal('');

  const handleKeySubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidOpenAIKey(apiKey())) {
      setError(new Error('Please enter a valid OpenAI API Key'));
      return;
    }

    if (persistKey()) {
      try {
        await storeSecret(apiKey(), passphrase());
      } catch (e: unknown) {
        setError(e as Error);
        return;
      }
    }
    setPhase(PHASES.TOPIC_ENTRY);
  };

  const handlePassphraseSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    let storedKey: string | undefined;
    setError(null);

    try {
      storedKey = await retrieveSecret(passphraseInput());
    } catch (e: unknown) {
      setError(e as Error);
      return;
    }

    if (storedKey && isValidOpenAIKey(storedKey)) {
      setApiKey(storedKey);
      setPhase(PHASES.TOPIC_ENTRY);
    } else {
      setError(
        new Error('Incorrect Passphrase or Invalid API Key found in storage.')
      );
    }
  };

  const handleTopicSubmit = async (e: SubmitEvent) => {
    setError(null);

    e.preventDefault();
    setPhase(PHASES.DEBATE);
  };

  const handleDeleteClick = async () => {
    setError(null);

    clearSecret();
    setPhase(PHASES.KEY_ENTRY);
  };

  onMount(() => {
    if (hasSecret()) {
      setPhase(PHASES.PASSPHRASE_ENTRY);
    } else {
      setPhase(PHASES.KEY_ENTRY);
    }
  });

  return (
    <main>
      <header class={styles.main_header}>
        <h1>DebateGPT</h1>
      </header>
      <div class={styles.form_wrap}>
        <Show when={error()}>
          <div class={styles.error_banner}>
            <span onClick={() => setError(null)}>&times;</span>
            <h3>Errors Encountered</h3>
            {error()?.message}
          </div>
        </Show>
        <Switch fallback={<div>loading...</div>}>
          <Match when={phase() === PHASES.KEY_ENTRY}>
            <form onSubmit={(e) => handleKeySubmit(e)}>
              <header>
                <span>Step 1</span>
                <h2>Enter Your OpenAI API Key</h2>
              </header>
              <div class={styles.input_wrap}>
                <label for="apiKey">OpenAI API Key</label>
                <input
                  id="apiKey"
                  minlength={32}
                  type="text"
                  autofocus
                  required
                  value={apiKey()}
                  onInput={(e) => setApiKey(e.currentTarget.value)}
                />
              </div>
              <div class={styles.input_wrap}>
                <label for="persistToggle">
                  <input
                    type="checkbox"
                    id="persistToggle"
                    checked={persistKey()}
                    onChange={(e) => setPersistKey(e.currentTarget.checked)}
                  />
                  Remember my API Key for this browser session
                </label>
              </div>
              <Show when={persistKey()}>
                <div class={styles.input_wrap}>
                  <label for="passphrase_new">Enter a Passphrase</label>
                  <small>
                    You must enter this to retrieve and use your stored API Key
                    in future browsers sessions.
                  </small>
                  <input
                    id="passphrase_new"
                    type="password"
                    value={passphrase()}
                    onInput={(e) => setPassphrase(e.currentTarget.value)}
                  />
                </div>
              </Show>
              <footer>
                <button type="submit">Submit</button>
              </footer>
            </form>
          </Match>
          <Match when={phase() === PHASES.PASSPHRASE_ENTRY}>
            <form onSubmit={(e) => handlePassphraseSubmit(e)}>
              <header>
                <span>Step 1</span>
                <h2>Stored API Key Discovered</h2>
              </header>
              <div class={styles.input_wrap}>
                <label for="passphrase_input">Passphrase</label>
                <input
                  type="password"
                  id="passphrase_input"
                  value={passphraseInput()}
                  onInput={(e) => setPassphraseInput(e.currentTarget.value)}
                />
              </div>
              <footer>
                <button type="submit">Decrypt stored API Key</button>
                <button
                  type="button"
                  class={styles.danger_button}
                  onClick={() => {
                    if (
                      confirm(
                        'Are you sure you want to delete your stored API Key?'
                      )
                    ) {
                      handleDeleteClick();
                    }
                  }}
                >
                  Delete Stored API Key...
                </button>
              </footer>
            </form>
          </Match>
          <Match when={phase() === PHASES.TOPIC_ENTRY}>
            <form onSubmit={(e) => handleTopicSubmit(e)}>
              <header>
                <span>Step 2</span>
                <h2>Choose Initial Arguments.</h2>
              </header>
              <div class={styles.input_wrap}>
                <label for="debateTopicA">Argument A</label>
                <input
                  name="debateTopicA"
                  type="text"
                  autofocus
                  required
                  value={debateTopicA()}
                  onInput={(e) => setDebateTopicA(e.currentTarget.value)}
                />
              </div>
              <div class={styles.input_wrap}>
                <label for="debateTopicB">Argument B</label>
                <input
                  type="text"
                  name="debateTopicB"
                  required
                  value={debateTopicB()}
                  onInput={(e) => setDebateTopicB(e.currentTarget.value)}
                />
              </div>
              <footer>
                <button type="submit">Submit</button>
              </footer>
            </form>
          </Match>
          <Match when={phase() === PHASES.DEBATE}>
            <div class={styles.debate_wrap}>
              <DebateChat
                debateTopics={{
                  a: debateTopicA(),
                  b: debateTopicB(),
                }}
                apiKey={apiKey()}
                onReset={() => setPhase(PHASES.TOPIC_ENTRY)}
              />
            </div>
          </Match>
        </Switch>
      </div>
    </main>
  );
}
