import type { ReactChild } from "react";

function Layout(props: {
  content: ReactChild;
  preview: ReactChild;
  head: ReactChild;
}) {
  return (
    <main className="flex-col h-screen select-none overflow-hidden">
      <section className="flex-grow-0 text-gray-500">{props.head}</section>

      <div className="flex-grow flex max-h-full">
        <section className="grow w-0 overflow-auto pb-10">
          {props.content}
        </section>
        <section className="w-[800px] overflow-auto pb-10">
          {props.preview}
        </section>
      </div>
    </main>
  );
}

export { Layout };
