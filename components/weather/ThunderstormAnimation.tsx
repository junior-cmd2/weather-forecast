"use client";

export default function ThunderstormAnimation() {
  return (
    <>
      <style jsx>{`
        @keyframes cloud-float {
          0%,
          100% {
            transform: translate(-50%, -50%);
          }
          50% {
            transform: translate(-50%, calc(-50% - 5px));
          }
        }

        @keyframes lightning-flash {
          0%,
          15%,
          19%,
          23%,
          100% {
            opacity: 0;
            filter: drop-shadow(0 0 0 transparent);
          }

          16%,
          18%,
          20%,
          22% {
            opacity: 1;
            filter: drop-shadow(0 0 12px #facc15);
          }
        }

        @keyframes rain-fall {
          0% {
            transform: translateY(-5px);
            opacity: 0;
          }

          20% {
            opacity: 0.8;
          }

          100% {
            transform: translateY(125px);
            opacity: 0;
          }
        }

        @keyframes glow-pulse {
          0%,
          100% {
            opacity: 0.2;
          }

          50% {
            opacity: 0.7;
          }
        }

        .storm-cloud {
          animation: cloud-float 3s ease-in-out infinite;
        }

        .lightning-bolt {
          opacity: 0;
          animation: lightning-flash 2.8s linear infinite;
        }

        .lightning-second {
          animation-delay: 1.1s;
        }

        .rain-drop {
          animation: rain-fall 1.2s linear infinite;
        }

        .lightning-glow {
          animation: glow-pulse 2.8s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .storm-cloud,
          .lightning-bolt,
          .rain-drop,
          .lightning-glow {
            animation: none;
          }

          .lightning-bolt {
            opacity: 1;
          }
        }
      `}</style>

      <div
        role="status"
        aria-live="polite"
        aria-label="Loading weather data"
        className="fixed inset-0 z-50 flex h-dvh w-screen items-center justify-center overflow-hidden bg-white dark:bg-slate-950"
      >
        <span className="sr-only">Loading weather data...</span>

        <div className="lightning-glow absolute left-1/2 top-1/2 h-32 w-40 -translate-x-1/2 translate-y-4 rounded-full bg-yellow-300/30 blur-3xl" />

        <svg
          viewBox="0 0 220 130"
          className="storm-cloud absolute left-1/2 top-1/2 z-10 w-56 -translate-x-1/2 -translate-y-1/2 drop-shadow-md sm:w-64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M43 92C19 92 10 76 16 59C21 44 36 38 51 43C57 18 81 9 102 24C117 1 157 8 165 35C190 28 209 47 204 69C218 84 201 98 184 98H43Z"
            fill="#64748b"
          />
          <path
            d="M43 84C23 84 19 69 28 57C36 46 48 47 59 53C65 28 89 22 107 38C122 15 153 22 161 47C181 39 197 53 193 70C207 81 193 89 178 89H43Z"
            fill="#94a3b8"
          />
          <path
            d="M59 52C70 30 91 28 107 42C123 19 150 27 158 49C174 43 187 53 188 65C168 58 155 71 142 68C126 79 113 65 99 73C83 82 69 70 52 78C34 83 25 70 31 60C37 53 48 49 59 52Z"
            fill="#cbd5e1"
          />
          <path
            d="M43 84C69 94 89 78 105 87C125 96 142 79 159 88C175 94 190 84 198 74C202 89 191 98 177 98H43C29 98 17 91 16 78C24 87 32 89 43 84Z"
            fill="#334155"
            opacity=".85"
          />
        </svg>

        {Array.from({ length: 9 }).map((_, index) => (
          <span
            key={index}
            className="rain-drop absolute top-1/2 z-0 h-4 w-1 rounded-full bg-sky-500/80"
            style={{
              left: `${18 + index * 8}%`,
              animationDelay: `${(index % 4) * 0.25}s`,
            }}
            aria-hidden="true"
          />
        ))}

        <svg
          viewBox="0 0 120 150"
          className="lightning-bolt absolute left-[37%] top-1/2 z-20 h-28 w-16 translate-y-4 sm:left-[42%]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M68 0L30 70H57L39 133L91 52H62L80 0H68Z"
            fill="#fde047"
            stroke="#fef9c3"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>

        <svg
          viewBox="0 0 120 150"
          className="lightning-bolt lightning-second absolute right-[30%] top-1/2 z-20 h-24 w-14 translate-y-8 sm:right-[35%]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M68 0L30 70H57L39 133L91 52H62L80 0H68Z"
            fill="#facc15"
            stroke="#fef08a"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>

        <p className="absolute bottom-12 text-sm font-medium text-slate-600 dark:text-slate-300">
          Loading weather data...
        </p>
      </div>
    </>
  );
}
