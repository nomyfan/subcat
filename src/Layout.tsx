import type { ReactChild } from "react";

function Layout(props: { content: ReactChild; preview: ReactChild }) {
  return (
    <main className="flex layout">
      <section className="layout_content">{props.content}</section>
      <section className="layout_preview">{props.preview}</section>
    </main>
  );
}

export { Layout };
