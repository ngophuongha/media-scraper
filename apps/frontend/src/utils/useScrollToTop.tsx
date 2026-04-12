import { useEffect, useState } from "react";
import { debounce } from "./debounce";

export const useScrollToTop = () => {
  const [shouldShowScrollTop, setShouldShowScrollTop] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      // Threshold: 5 times the viewport height
      if (window.scrollY > window.innerHeight * 5) {
        setShouldShowScrollTop(true);
      } else {
        setShouldShowScrollTop(false);
      }
    };
    const debouncedHandleSCroll = debounce(handleScroll, 300);

    window.addEventListener("scroll", debouncedHandleSCroll);
    return () => window.removeEventListener("scroll", debouncedHandleSCroll);
  }, []);

  return { shouldShowScrollTop, scrollToTop };
};
