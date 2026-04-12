import { SearchBar } from '../components/SearchBar';
import { BookOpen, Library, FileText, GraduationCap } from 'lucide-react';

export function Landing() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-muted mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          4 Open Libraries Connected
        </div>
        
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          The world's knowledge, <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            in one place.
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl text-muted mb-12 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Search millions of free books, academic papers, and classics across multiple open-access libraries with a single query.
        </p>
        
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
          <SearchBar />
        </div>
        
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto animate-in fade-in duration-1000 delay-500 mb-16">
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5">
            <Library className="w-6 h-6 text-[#3B82F6]" />
            <span className="text-sm font-medium text-muted">Open Library</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5">
            <BookOpen className="w-6 h-6 text-[#10B981]" />
            <span className="text-sm font-medium text-muted">Gutenberg</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5">
            <GraduationCap className="w-6 h-6 text-[#F59E0B]" />
            <span className="text-sm font-medium text-muted">arXiv</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5">
            <FileText className="w-6 h-6 text-[#8B5CF6]" />
            <span className="text-sm font-medium text-muted">Standard Ebooks</span>
          </div>
        </div>

        <div className="animate-in fade-in duration-1000 delay-700">
          <p className="text-sm text-muted mb-4">Popular searches</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Quantum Physics', 'Pride and Prejudice', 'Machine Learning', 'Frankenstein', 'Philosophy'].map(term => (
              <a key={term} href={`/search?q=${encodeURIComponent(term)}`} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors">
                {term}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
