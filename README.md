# DebateGPT

A single page app allowing a user to pit two OpenAI 'agents' against one another in open debate.

- Optionally store your personal OpenAI API key in SessionStorage in a secure manner. You will be required to enter a passphrase once during setup and for each successive new session.
- Utilize the streaming endpoint offered by OpenAI's API, for a more visually stimulating discourse betwixt the hapless bots.
- Some knowledge jousts may decide a winner (by the loser declaring their concession), others will end in a draw when the number of ripostes reaches an inbuilt maximum.
- Randomly chosen imagery to backdrop the festivities.

## Some ideas

A few debates that proved most entertaining

- "Xylophone should start with a Z" vs "Xylophone should start with an X"
- "Cars are good for chickens" vs "Cars are bad for chickens"
- "The sky is blue" vs "The ocean is blue"
- "asdf" vs "asdf" (The bots apologize profusely for misunderstanding each other and choose their own topic. lol.)
- "My cat's breath smells like cat food" vs "Batman"

## Running the app locally

```bash
# clone this repo and cd into it prior to running these commands

# Install dependencies (first run, and when dependencies change)
npm install

# Start the localhost app, automatically opening the target URL (https://localhost:3000) in your default browser
# NOTE: you may need to provide your Operating System with elevated privileges the first run, in order for the self-signing SSL cert utility to work properly.
npm run dev -- --open
```
