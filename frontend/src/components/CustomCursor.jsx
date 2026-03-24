import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export default function CustomCursor({ isHovering }) {
  const [isVisible, setIsVisible] = useState(false);

  // Raw mouse coordinates
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Physics springs for the elegant trailing ring
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [cursorX, cursorY, isVisible]);

  if (typeof window === "undefined") return null;

  return (
    <>
      {/* Primary Dot (Instant tracking) */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full z-[9999] mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: isVisible ? 1 : 0,
          scale: isHovering ? 0 : 1, // Hide dot when hovering
        }}
        transition={{ duration: 0.15 }}
      />
      
      {/* Secondary Ring (Spring physics trailing) */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 w-10 h-10 border-[1.5px] border-blue-500 dark:border-blue-300 rounded-full z-[9998] mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          scale: isHovering ? 1.8 : 1,
          backgroundColor: isHovering ? "rgba(59, 130, 246, 0.2)" : "transparent",
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />
    </>
  );
}
