import { useEffect, useMemo, useState } from "react";

export function useMasonry<T>(items: T[]) {
  const [columnCount, setColumnCount] = useState(1);

  useEffect(() => {
    const updateColumnCount = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setColumnCount(4); // xl
      } else if (width >= 1024) {
        setColumnCount(3); // lg
      } else if (width >= 640) {
        setColumnCount(2); // sm
      } else {
        setColumnCount(1); // default
      }
    };

    updateColumnCount();
    window.addEventListener("resize", updateColumnCount);
    return () => window.removeEventListener("resize", updateColumnCount);
  }, []);

  const columns = useMemo(() => {
    const cols: T[][] = Array.from({ length: columnCount }, () => []);
    for (let i = 0; i < items.length; i++) {
      cols[i % columnCount].push(items[i]);
    }
    return cols;
  }, [items, columnCount]);

  return { columns, columnCount };
}
