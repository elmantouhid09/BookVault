import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { cn } from '../lib/utils';

export function SearchBar({ initialQuery = '', className, autoFocus = false }) {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (query !== initialQuery && query.trim() !== '') {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      }, 400);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, navigate, initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative w-full max-w-2xl mx-auto group", className)}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-muted group-focus-within:text-primary transition-colors" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="glass-panel block w-full pl-12 pr-4 py-4 rounded-2xl text-lg placeholder-muted focus:outline-none transition-all"
        placeholder="Search books, papers, authors..."
        autoFocus={autoFocus}
      />
      <button 
        type="submit"
        className="absolute inset-y-2 right-2 btn-primary px-6 font-medium rounded-xl"
      >
        Search
      </button>
    </form>
  );
}
