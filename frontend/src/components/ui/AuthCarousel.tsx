import {
  useEffect,
  useState,
} from "react";

import {
  BrainCircuit,
  FileSearch,
  Workflow,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

const slides = [
  {
    title: "Grounded intelligence",
    description:
      "Retrieve relevant document evidence before generating an AI answer.",
    icon: FileSearch,
    tag: "RAG",
  },
  {
    title: "Actionable workflows",
    description:
      "Transform complex process documents into structured step-by-step plans.",
    icon: Workflow,
    tag: "WORKFLOWS",
  },
  {
    title: "Controlled AI agents",
    description:
      "Allow-listed tools perform protected actions without uncontrolled access.",
    icon: BrainCircuit,
    tag: "AGENTS",
  },
];

export default function AuthCarousel() {
  const [index, setIndex] =
    useState(0);

  useEffect(() => {
    const timer =
      window.setInterval(() => {
        setIndex(
          (current) =>
            (current + 1) %
            slides.length
        );
      }, 4200);

    return () =>
      window.clearInterval(timer);
  }, []);

  const slide = slides[index];
  const Icon = slide.icon;

  return (
    <div className="auth-carousel">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{
            opacity: 0,
            y: 14,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: -10,
          }}
          transition={{
            duration: .35,
          }}
          className="auth-carousel-slide"
        >
          <div className="auth-carousel-icon">
            <Icon size={21} />
          </div>

          <div>
            <span>
              {slide.tag}
            </span>

            <strong>
              {slide.title}
            </strong>

            <p>
              {slide.description}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="auth-carousel-dots">
        {slides.map((_, dotIndex) => (
          <button
            key={dotIndex}
            className={
              index === dotIndex
                ? "active"
                : ""
            }
            onClick={() =>
              setIndex(dotIndex)
            }
            aria-label={`Show slide ${dotIndex + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
