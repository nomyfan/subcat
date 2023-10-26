import type { ReactNode } from "react";
import { Separator } from "subcat/components/ui/separator";

function Layout(props: {
  middle: ReactNode;
  right: ReactNode;
  head: ReactNode;
  left: ReactNode;
}) {
  return (
    <main className="flex flex-col h-screen select-none overflow-hidden">
      <section className="flex-grow-0">{props.head}</section>
      <Separator orientation="horizontal" />

      <div className="flex-grow flex" style={{ height: "calc(100% - 40px)" }}>
        <section className="w-[300px] overflow-auto">{props.left}</section>
        <Separator orientation="vertical" />
        <section className="grow w-0">{props.middle}</section>
        <Separator orientation="vertical" />
        <section className="w-[800px] overflow-auto pb-10">
          {props.right}
        </section>
      </div>
    </main>
  );
}

export { Layout };
