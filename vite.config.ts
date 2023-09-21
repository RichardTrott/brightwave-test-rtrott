import staticAdapter from "solid-start-static";
import solid from "solid-start/vite";
import { defineConfig } from "vite";
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  server: { https: true },
  plugins: [
    mkcert(),
    solid({
      ssr: false,
      adapter: staticAdapter()
    }),
  ],
});
