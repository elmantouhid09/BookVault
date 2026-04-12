import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, BookOpen, Bookmark, User, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl tracking-tight">BookVault</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/saved" className="text-muted hover:text-white transition-colors flex items-center gap-2">
              <Bookmark className="w-5 h-5" />
              <span className="hidden sm:inline">Saved</span>
            </Link>
            
            {user ? (
              <button 
                onClick={handleLogout}
                className="text-muted hover:text-white transition-colors flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <Link to="/login" className="btn-primary px-4 py-2 text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
