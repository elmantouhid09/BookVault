import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { BookCard, SkeletonCard } from '../components/BookCard';
import { searchAllSources } from '../lib/api';
import { supabase } from '../lib/supabase';
import { ExternalLink, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const TABS = ['All', 'Books', 'Papers', 'Classics', 'External Sources'];

export function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [savedBooks, setSavedBooks] = useState(new Set());
  const [user, setUser] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchSavedBooks(session.user.id);
      }
    });
  }, []);

  const fetchSavedBooks = async (userId) => {
    const { data } = await supabase
      .from('saved_books')
      .select('book_id')
      .eq('user_id', userId);
    
    if (data) {
      setSavedBooks(new Set(data.map(d => d.book_id)));
    }
  };

  useEffect(() => {
    if (!query) return;
    
    let isMounted = true;
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchAllSources(query);
        if (isMounted) {
          setResults(data);
        }
      } catch (err) {
        if (isMounted) setError("Failed to fetch results. Please try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Debounce is handled by SearchBar form submission, but we can add a small delay here if needed
    fetchResults();

    return () => { isMounted = false; };
  }, [query]);

  const handleSaveToggle = async (book) => {
    if (!user) {
      // Could redirect to login or show toast
      alert("Please sign in to save books");
      return;
    }

    const isSaved = savedBooks.has(book.id);
    const newSaved = new Set(savedBooks);

    if (isSaved) {
      newSaved.delete(book.id);
      setSavedBooks(newSaved);
      await supabase.from('saved_books').delete().eq('user_id', user.id).eq('book_id', book.id);
    } else {
      newSaved.add(book.id);
      setSavedBooks(newSaved);
      await supabase.from('saved_books').insert({
        user_id: user.id,
        book_id: book.id,
        source: book.source,
        title: book.title,
        author: book.author,
        cover_url: book.cover,
        download_url: book.downloadUrl,
      });
    }
  };

  const filteredResults = results.filter(book => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Books') return book.type === 'book';
    if (activeTab === 'Papers') return book.type === 'paper';
    if (activeTab === 'Classics') return book.type === 'classic';
    if (activeTab === 'External Sources') return false; // Handled separately
    return true;
  });

  return (
    <div className="flex-1 flex flex-col">
      <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-xl border-b border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchBar initialQuery={query} />
          
          <div className="flex items-center gap-6 mt-6 overflow-x-auto pb-2 scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "whitespace-nowrap pb-2 text-sm font-medium transition-colors relative",
                  activeTab === tab ? "text-primary" : "text-muted hover:text-white"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {isOffline && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-4 rounded-xl flex items-center gap-3 mb-8">
            <AlertCircle className="w-5 h-5" />
            <p>You are currently offline. Showing cached results if available.</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 mb-8">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {!loading && results.length > 0 && activeTab !== 'External Sources' && (
          <p className="text-muted text-sm mb-6">
            {filteredResults.length} results from {new Set(filteredResults.map(r => r.source)).size} sources
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : activeTab === 'External Sources' ? (
          <div className="text-center py-20 max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-2">Search External Libraries</h3>
            <p className="text-muted mb-8">
              Explore these external sources directly for more results:
            </p>
            <div className="flex flex-col gap-3">
              <a href={`https://annas-archive.gl/search?q=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer" className="btn-secondary py-3 px-4 flex items-center justify-between group">
                <span>Anna's Archive</span>
                <ExternalLink className="w-4 h-4 text-muted group-hover:text-white transition-colors" />
              </a>
              <a href={`https://libgen.is/search.php?req=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer" className="btn-secondary py-3 px-4 flex items-center justify-between group">
                <span>Library Genesis</span>
                <ExternalLink className="w-4 h-4 text-muted group-hover:text-white transition-colors" />
              </a>
              <a href={`https://www.pdfdrive.com/search?q=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer" className="btn-secondary py-3 px-4 flex items-center justify-between group">
                <span>PDF Drive</span>
                <ExternalLink className="w-4 h-4 text-muted group-hover:text-white transition-colors" />
              </a>
              <a href={`https://z-lib.gs/s/${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer" className="btn-secondary py-3 px-4 flex items-center justify-between group">
                <span>Z-Library</span>
                <ExternalLink className="w-4 h-4 text-muted group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResults.map((book, i) => (
              <BookCard 
                key={book.id} 
                book={book} 
                index={i} 
                isSaved={savedBooks.has(book.id)}
                onSaveToggle={handleSaveToggle}
              />
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-muted" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No direct results found</h3>
            <p className="text-muted mb-8">
              We couldn't find any matches in our open libraries. Try searching externally:
            </p>
            <div className="flex flex-col gap-3">
              <a href={`https://annas-archive.gl/search?q=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer" className="btn-secondary py-3 px-4 flex items-center justify-between group">
                <span>Anna's Archive</span>
                <ExternalLink className="w-4 h-4 text-muted group-hover:text-white transition-colors" />
              </a>
              <a href={`https://libgen.is/search.php?req=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer" className="btn-secondary py-3 px-4 flex items-center justify-between group">
                <span>Library Genesis</span>
                <ExternalLink className="w-4 h-4 text-muted group-hover:text-white transition-colors" />
              </a>
              <a href={`https://www.pdfdrive.com/search?q=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer" className="btn-secondary py-3 px-4 flex items-center justify-between group">
                <span>PDF Drive</span>
                <ExternalLink className="w-4 h-4 text-muted group-hover:text-white transition-colors" />
              </a>
              <a href={`https://z-lib.gs/s/${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer" className="btn-secondary py-3 px-4 flex items-center justify-between group">
                <span>Z-Library</span>
                <ExternalLink className="w-4 h-4 text-muted group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
