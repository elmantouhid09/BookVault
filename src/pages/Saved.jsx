import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BookCard } from '../components/BookCard';
import { Bookmark, Search } from 'lucide-react';

export function Saved() {
  const [savedBooks, setSavedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (!session) {
          navigate('/login');
          return;
        }
        setUser(session.user);
        fetchSavedBooks(session.user.id);
      } catch (err) {
        console.error('Auth check failed:', err);
        // If it's a connection error, we might want to show an error state instead of just redirecting
        if (err.message === 'Failed to fetch') {
          setLoading(false);
          // We could set an error state here if we had one
        } else {
          navigate('/login');
        }
      }
    };
    checkAuth();
  }, [navigate]);

  const fetchSavedBooks = async (userId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('saved_books')
      .select('*')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });
    
    if (!error && data) {
      // Map to BookCard expected format
      const formatted = data.map(d => ({
        id: d.book_id,
        title: d.title,
        author: d.author,
        cover: d.cover_url,
        source: d.source,
        downloadUrl: d.download_url,
        formats: ['Link'],
        year: null,
      }));
      setSavedBooks(formatted);
    }
    setLoading(false);
  };

  const handleSaveToggle = async (book) => {
    // Optimistic remove
    setSavedBooks(prev => prev.filter(b => b.id !== book.id));
    await supabase.from('saved_books').delete().eq('user_id', user.id).eq('book_id', book.id);
  };

  if (loading) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Bookmark className="w-8 h-8 text-primary" />
          Saved Books
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Bookmark className="w-8 h-8 text-primary fill-primary/20" />
        Saved Books
      </h1>

      {savedBooks.length > 0 ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {savedBooks.map((book, i) => (
            <div key={book.id} className="break-inside-avoid">
              <BookCard 
                book={book} 
                index={i} 
                isSaved={true}
                onSaveToggle={handleSaveToggle}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 max-w-md mx-auto bg-surface border border-white/10 rounded-3xl p-8">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bookmark className="w-8 h-8 text-muted" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No saved books yet</h3>
          <p className="text-muted mb-8">
            Start exploring and save books to your personal vault to read them later.
          </p>
          <Link to="/" className="btn-primary px-6 py-3 font-medium inline-flex items-center gap-2">
            <Search className="w-4 h-4" />
            Discover Books
          </Link>
        </div>
      )}
    </div>
  );
}
