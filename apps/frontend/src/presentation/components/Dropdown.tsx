import { useGetScrapedPages } from "../../application/useGetScrapedPages";

type DropdownProps = {
    sourceUrl: string;
    setSourceUrl: (sourceUrl: string) => void;
}
export const Dropdown = ({sourceUrl, setSourceUrl}: DropdownProps) => {
  const { data: scrapedPagesMap } = useGetScrapedPages();
  const domains = scrapedPagesMap ? Object.keys(scrapedPagesMap) : [];
    return (
        <select 
            value={sourceUrl} 
            onChange={(e) => setSourceUrl(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-brand-gradient-middle/20 outline-none text-gray-700 min-w-[140px] max-w-[200px] truncate"
          >
            <option value="">All Pages</option>
            {domains.map(domain => (
              <optgroup key={domain} label={domain}>
                {scrapedPagesMap![domain].map(page => (
                  <option key={page.id} value={page.url}>
                    {page.url.replace(/^https?:\/\//, '')}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
    )
}