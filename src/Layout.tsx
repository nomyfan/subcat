import type { ReactChild } from "react";

function Layout(props: {
  middle: ReactChild;
  right: ReactChild;
  head: ReactChild;
  left: ReactChild;
}) {
  return (
    <main className="bg-neutral-800 flex flex-col h-screen select-none overflow-hidden">
      <section className="flex-grow-0 text-gray-500">{props.head}</section>

      <div className="flex-grow flex" style={{ height: "calc(100% - 40px)" }}>
        <section className="w-[300px] overflow-auto">{props.left}</section>

        <section className="grow w-0 bg-neutral-900">{props.middle}</section>

        <section className="w-[800px] overflow-auto pb-10">
          {props.right}
        </section>
      </div>
    </main>
  );
}

export { Layout };
