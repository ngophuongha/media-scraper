import { create } from "zustand";
import type { FilterType } from "../components/Filter";
import type { MediaItemData } from "../components/MediaItem";
import { SortType } from "../components/Sort";

interface MediaListState {
  filter: FilterType;
  search: string;
  debouncedSearch: string;
  sort: SortType;
  sourceUrl: string;
  selectedMedia: MediaItemData | null;
  
  // Actions
  setFilter: (filter: FilterType) => void;
  setSearch: (search: string) => void;
  setDebouncedSearch: (debouncedSearch: string) => void;
  setSort: (sort: SortType) => void;
  setSourceUrl: (sourceUrl: string) => void;
  setSelectedMedia: (media: MediaItemData | null) => void;
  resetFilters: () => void;
}

export const useMediaListStore = create<MediaListState>((set) => ({
  filter: "all",
  search: "",
  debouncedSearch: "",
  sort: "desc",
  sourceUrl: "",
  selectedMedia: null,

  setFilter: (filter) => set({ filter }),
  setSearch: (search) => set({ search }),
  setDebouncedSearch: (debouncedSearch) => set({ debouncedSearch }),
  setSort: (sort) => set({ sort }),
  setSourceUrl: (sourceUrl) => set({ sourceUrl }),
  setSelectedMedia: (selectedMedia) => set({ selectedMedia }),
  resetFilters: () => set({ 
    filter: "all", 
    search: "", 
    debouncedSearch: "", 
    sort: "desc", 
    sourceUrl: "" 
  }),
}));
