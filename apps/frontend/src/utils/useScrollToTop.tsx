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
      // Threshold to show Move To TOp btn: 3 times the viewport height
      if (window.scrollY > window.innerHeight * 3) {
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
