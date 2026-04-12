import { useLocation, useParams } from 'react-router-dom';
import { ExternalLink, Download, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function BookDetail() {
  const { id } = useParams();
  const location = useLocation();
  const book = location.state?.book;

  if (!book) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted">Book not found. Please go back and search again.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative">
      <div className="absolute inset-0 h-[50vh] overflow-hidden pointer-events-none">
        {book.cover ? (
          <img src={book.cover} alt="" className="w-full h-full object-cover opacity-20 blur-3xl" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 opacity-30 blur-3xl" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full">
        <Link to={-1} className="inline-flex items-center gap-2 text-muted hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to results
        </Link>

        <div className="flex flex-col md:flex-row gap-12 items-start">
          <div className="w-full md:w-1/3 max-w-sm mx-auto md:mx-0 shrink-0">
            <div className="aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-primary/10">
              {book.cover ? (
                <img src={book.cover} alt={book.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full bg-surface flex items-center justify-center p-8 text-center">
                  <span className="font-serif text-2xl font-bold text-white/50">{book.title}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5 text-muted">
                  {book.source}
                </span>
                {book.year && (
                  <span className="text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5 text-muted">
                    {book.year}
                  </span>
                )}
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 leading-tight">
                {book.title}
              </h1>
              <p className="text-xl text-muted">by {book.author}</p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-white/10">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                Download Free
              </h3>
              <div className="flex flex-wrap gap-3 mb-6">
                {book.formats.map(fmt => (
                  <a 
                    key={fmt}
                    href={book.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary px-6 py-3 font-medium flex items-center gap-2"
                  >
                    {fmt} <ExternalLink className="w-4 h-4" />
                  </a>
                ))}
              </div>

              <div className="h-px bg-white/10 my-6" />

              <h4 className="text-sm font-medium text-muted mb-4 uppercase tracking-wider">Also available on</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a href={`https://annas-archive.gl/search?q=${encodeURIComponent(book.title + ' ' + book.author)}`} target="_blank" rel="noopener noreferrer" className="btn-secondary py-2.5 px-4 flex items-center justify-between group text-sm">
                  <span>Anna's Archive</span>
                  <ExternalLink className="w-3.5 h-3.5 text-muted group-hover:text-white transition-colors" />
                </a>
                <a href={`https://libgen.is/search.php?req=${encodeURIComponent(book.title + ' ' + book.author)}`} target="_blank" rel="noopener noreferrer" className="btn-secondary py-2.5 px-4 flex items-center justify-between group text-sm">
                  <span>Library Genesis</span>
                  <ExternalLink className="w-3.5 h-3.5 text-muted group-hover:text-white transition-colors" />
                </a>
                <a href={`https://www.pdfdrive.com/search?q=${encodeURIComponent(book.title + ' ' + book.author)}`} target="_blank" rel="noopener noreferrer" className="btn-secondary py-2.5 px-4 flex items-center justify-between group text-sm">
                  <span>PDF Drive</span>
                  <ExternalLink className="w-3.5 h-3.5 text-muted group-hover:text-white transition-colors" />
                </a>
                <a href={`https://z-lib.gs/s/${encodeURIComponent(book.title + ' ' + book.author)}`} target="_blank" rel="noopener noreferrer" className="btn-secondary py-2.5 px-4 flex items-center justify-between group text-sm">
                  <span>Z-Library</span>
                  <ExternalLink className="w-3.5 h-3.5 text-muted group-hover:text-white transition-colors" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
