import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col h-full">
      <div className="flex flex-col p-5 h-60 justify-center gap-5 text-white">
        <h1 className="text-6xl uppercase text-center font-oxanium">
          Deepspace<span className="font-bold">Archive</span>
        </h1>
        <p className="text-center">
          Welcome! You can view Love and Deepspace's cards/memories here.
        </p>
      </div>
    </main>
  );
}
