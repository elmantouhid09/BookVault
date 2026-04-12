import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

const sourceColors = {
  'Open Library': 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20',
  'Project Gutenberg': 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
  'arXiv': 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
  'Standard Ebooks': 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20',
  'External': 'bg-[#475569]/10 text-[#475569] border-[#475569]/20',
};

export function BookCard({ book, index, isSaved = false, onSaveToggle }) {
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    await onSaveToggle(book);
    setSaving(false);
  };

  return (
    <Link 
      to={`/book/${encodeURIComponent(book.id)}`} 
      state={{ book }}
      className="card-hover bg-surface border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full group animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface flex items-center justify-center">
        {book.cover ? (
          <img 
            src={book.cover} 
            alt={book.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex flex-col items-center justify-center p-6 text-center">
            <span className="font-serif text-xl font-bold text-white/50 line-clamp-3">{book.title}</span>
          </div>
        )}
        
        <button 
          onClick={handleSave}
          className="absolute top-3 right-3 p-2 rounded-full glass-panel hover:bg-white/10 transition-colors z-10"
        >
          <Heart className={cn("w-5 h-5 transition-colors", isSaved ? "fill-primary text-primary" : "text-white")} />
        </button>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-medium text-base line-clamp-2 leading-snug">{book.title}</h3>
        </div>
        
        <p className="text-muted text-sm mb-4 line-clamp-1">{book.author}</p>
        
        <div className="mt-auto space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className={cn("text-xs px-2.5 py-1 rounded-md border font-medium", sourceColors[book.source] || sourceColors['External'])}>
              {book.source}
            </span>
            {book.year && (
              <span className="text-xs px-2.5 py-1 rounded-md border border-white/10 bg-white/5 text-muted">
                {book.year}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex flex-wrap gap-1.5">
              {book.formats.slice(0, 3).map(fmt => (
                <span key={fmt} className="text-[10px] uppercase tracking-wider font-semibold text-muted bg-white/5 px-1.5 py-0.5 rounded">
                  {fmt}
                </span>
              ))}
            </div>
          </div>
          
          <div className="pt-2">
            <button 
              className="w-full btn-primary py-2 text-sm font-medium flex items-center justify-center gap-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(book.downloadUrl, '_blank', 'noopener,noreferrer');
              }}
            >
              Get Free
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-surface border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="aspect-[2/3] w-full skeleton" />
      <div className="p-5 flex flex-col flex-1 gap-4">
        <div className="space-y-2">
          <div className="h-5 skeleton rounded w-full" />
          <div className="h-5 skeleton rounded w-2/3" />
        </div>
        <div className="h-4 skeleton rounded w-1/2" />
        <div className="mt-auto space-y-4">
          <div className="flex gap-2">
            <div className="h-6 skeleton rounded w-24" />
            <div className="h-6 skeleton rounded w-12" />
          </div>
          <div className="pt-4 border-t border-white/5 flex justify-between">
            <div className="h-4 skeleton rounded w-16" />
            <div className="h-4 skeleton rounded w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
