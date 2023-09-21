// @refresh reload
import { Routes } from '@solidjs/router';
import { Suspense } from 'solid-js';
import {
  Body,
  FileRoutes,
  Head,
  Html,
  Meta,
  Scripts,
  Title,
  Link,
} from 'solid-start';
import { ErrorBoundary } from 'solid-start/error-boundary';

export default function Root() {
  return (
    <Html lang="en">
      <Head>
        <Title>Brightwave Test - RTROTT</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
        <Link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Lora"
        ></Link>
        <Link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Ubuntu"
        ></Link>
      </Head>
      <Body>
        <Suspense>
          <ErrorBoundary>
            <Routes>
              <FileRoutes />
            </Routes>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
