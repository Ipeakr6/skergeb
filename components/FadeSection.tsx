"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, Heart } from "lucide-react";
import Image from "next/image";

type SlideLine =
  | string
  | {
      type: "image";
      src: string;
      alt?: string;
      caption?: string;
    }
  | {
      type: "video";
      src: string;
      caption?: string;
      poster?: string; // optional
      muted?: boolean; // default true (Autoplay braucht meistens muted)
      loop?: boolean; // default true
      controls?: boolean; // default false
    };

export type SlideData = {
  id: number;
  title: string;
  likes?: number;
  lines: SlideLine[];
  theme: {
    bg: string;
    title: string;
    text: string;
    border: string;
  };
};

export default function Slide({
  slide,
  isFirst = false,
}: {
  slide: SlideData;
  isFirst?: boolean;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { amount: 0.7 });

  // Scroll-Pfeil nur am Anfang
  const [showArrow, setShowArrow] = useState(true);

  // TikTok Like Button (pro Slide lokal)
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(slide.likes ?? 0);

  const lastTapRef = useRef(0);

  const onDoubleTap = () => {
    const now = Date.now();
    const delta = now - lastTapRef.current;

    // 300ms ist ein guter Double-Tap Zeitraum
    if (delta > 0 && delta < 300) {
      // force like (nur wenn noch nicht geliked)
      setLiked((prevLiked) => {
        if (!prevLiked) setLikes((l) => l + 1);
        return true;
      });
    }

    lastTapRef.current = now;
  };

  // WICHTIG: du scrollst im Container, nicht im window
  useEffect(() => {
    if (!isFirst) return;

    const scroller = document.getElementById("slides-scroller");
    if (!scroller) return;

    const handleScroll = () => {
      if (scroller.scrollTop > 20) setShowArrow(false);
    };

    scroller.addEventListener("scroll", handleScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", handleScroll);
  }, [isFirst]);

  const toggleLike = () => {
    setLiked((prev) => {
      const next = !prev;
      setLikes((l) => (next ? l + 1 : Math.max(0, l - 1)));
      return next;
    });
  };

  return (
    <section
      ref={ref}
      className={`relative h-dvh snap-start flex items-center justify-center ${slide.theme.bg}`}
    >
      {/* TikTok-like Action Bar rechts */}
      <div className="absolute bottom-30 right-6 flex flex-col items-center gap-3 z-20">
        <button
          onClick={toggleLike}
          className="rounded-full bg-white/10 backdrop-blur border border-white/15 p-3 active:scale-95 transition"
          aria-label="Like"
        >
          <motion.div
            animate={{ scale: liked ? [1, 1.25, 1] : 1 }}
            transition={{ duration: 0.25 }}
          >
            <Heart
              size={26}
              className={
                liked ? "fill-red-500 stroke-red-500" : "fill-none stroke-gray"
              }
            />
          </motion.div>
        </button>
        <div className="text-xs text-white/90">{likes}</div>
      </div>

      {/* Card */}
      <motion.div
        animate={{
          opacity: inView ? 1 : 0.25,
          scale: inView ? 1 : 0.98,
          y: inView ? 0 : 12,
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={`w-full ${slide.theme.border}`}
        onTouchEnd={onDoubleTap}
        onDoubleClick={() => {
          setLiked((prevLiked) => {
            if (!prevLiked) setLikes((l) => l + 1);
            return true;
          });
        }}
      >
        <h2 className={`text-5xl text-center font-bold ${slide.theme.title}`}>
          {slide.title}
        </h2>

        <div
          className={`mt-6 space-y-3 text-lg text-center ${slide.theme.text}`}
        >
          {slide.lines.map((line, idx) => {
            // Text
            if (typeof line === "string") {
              return (
                <p className="px-2" key={idx}>
                  {line}
                </p>
              );
            }

            // Image: { type:"image", src, alt, caption? }
            if (line && line.type === "image") {
              return (
                <figure key={idx} className="mt-4">
                  <div className="overflow-hidden">
                    <Image
                      src={line.src}
                      alt={line.alt || ""}
                      width={1200}
                      height={800}
                      className="h-auto w-full object-cover"
                      priority={slide.id === 1}
                    />
                  </div>

                  {line.caption ? (
                    <figcaption className="mt-2 text-sm opacity-80">
                      {line.caption}
                    </figcaption>
                  ) : null}
                </figure>
              );
            }

            // Video: { type:"video", src, poster?, caption? }
            if (line && line.type === "video") {
              const muted = line.muted ?? true;
              const loop = line.loop ?? true;
              const controls = line.controls ?? false;

              return (
                <figure key={idx} className="mt-4">
                  <div className="overflow-hidden">
                    <video
                      src={line.src}
                      poster={line.poster}
                      className="w-full h-auto object-cover"
                      playsInline
                      autoPlay
                      muted={muted}
                      loop={loop}
                      controls={controls}
                    />
                  </div>

                  {line.caption ? (
                    <figcaption className="mt-2 text-sm opacity-80">
                      {line.caption}
                    </figcaption>
                  ) : null}
                </figure>
              );
            }

            return null;
          })}
        </div>
      </motion.div>

      {/* Pfeil nur beim ersten Slide + nur solange noch nicht gescrollt */}
      {isFirst && inView && showArrow && (
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className={slide.theme.text}
          >
            <ArrowDown size={28} />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
