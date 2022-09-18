import type { ReactChild } from "react";

function Layout(props: { content: ReactChild; preview: ReactChild }) {
  return (
    <main className="flex h-screen select-none">
      <section className="grow w-0 overflow-auto">{props.content}</section>
      <section className="w-[800px]">{props.preview}</section>
    </main>
  );
}

export { Layout };
