import { Layers } from "lucide-react"

export const Header = () => {
    return (
              <header className="bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-gradient flex items-center justify-center text-white shadow-md">
                      <Layers className="w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-dark ">
                      MediaScraper
                    </h1>
                  </div>
                </div>
              </header>
    )
}