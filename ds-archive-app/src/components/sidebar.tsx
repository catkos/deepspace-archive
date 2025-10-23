import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="bg-black/80 max-w-64 min-w-64 backdrop-blur-[1px] border-r border-white/50 basis-64 h-screen text-white sticky top-0">
      <h1 className="text-xl p-5 uppercase flex font-oxanium">
        <span className="content-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={20}
            height={20}
            viewBox="0 0 256 256"
          >
            <path
              fill="currentColor"
              d="m235.24 84.38l-28.06 23.68l8.56 35.39a13.34 13.34 0 0 1-5.09 13.91a13.54 13.54 0 0 1-15 .69L164 139l-31.65 19.06a13.51 13.51 0 0 1-15-.69a13.32 13.32 0 0 1-5.1-13.91l8.56-35.39l-28.05-23.69a13.39 13.39 0 0 1 7.66-23.58l36.94-2.92l14.21-33.66a13.51 13.51 0 0 1 24.86 0l14.21 33.66l36.94 2.92a13.39 13.39 0 0 1 7.66 23.58M88.11 111.89a8 8 0 0 0-11.32 0l-58.45 58.45a8 8 0 0 0 11.32 11.32l58.45-58.45a8 8 0 0 0 0-11.32m-.5 61.19l-53.27 53.26a8 8 0 0 0 11.32 11.32l53.26-53.27a8 8 0 0 0-11.31-11.31m73-1l-54.29 54.28a8 8 0 0 0 11.32 11.32l54.28-54.28a8 8 0 0 0-11.31-11.32"
            ></path>
          </svg>
        </span>
        Deepspace<span className="font-bold">Archive</span>
      </h1>
      <nav className="flex flex-col">
        <Link href="/" className="p-5">
          Home
        </Link>
        <Link href="/memories" className="p-5">
          Memories
        </Link>
        <Link href="/add-card" className="p-5">
          Add card
        </Link>
      </nav>
    </div>
  );
}
