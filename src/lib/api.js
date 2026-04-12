export async function fetchOpenLibrary(query) {
  try {
    const res = await fetch(`/api/openlibrary?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.docs || []).slice(0, 10).map(doc => ({
      id: `ol_${doc.key.replace('/works/', '')}`,
      title: doc.title,
      author: doc.author_name ? doc.author_name[0] : 'Unknown Author',
      cover: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : null,
      year: doc.first_publish_year,
      formats: ['Read Online'],
      source: 'Open Library',
      downloadUrl: `https://openlibrary.org${doc.key}`,
      type: 'book'
    }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function fetchGutenberg(query) {
  try {
    const res = await fetch(`/api/gutenberg?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).slice(0, 10).map(doc => ({
      id: `gut_${doc.id}`,
      title: doc.title,
      author: doc.authors && doc.authors.length > 0 ? doc.authors[0].name : 'Unknown Author',
      cover: doc.formats['image/jpeg'] || null,
      year: null,
      formats: ['EPUB', 'HTML', 'TXT'],
      source: 'Project Gutenberg',
      downloadUrl: `https://gutenberg.org/ebooks/${doc.id}`,
      type: 'classic'
    }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function fetchArxiv(query) {
  try {
    const res = await fetch(`/api/arxiv?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    const entries = data.feed?.entry || [];
    // If single entry, it might not be an array
    const entryArray = Array.isArray(entries) ? entries : [entries];
    return entryArray.map(doc => ({
      id: `arx_${doc.id[0].split('/abs/')[1]}`,
      title: doc.title[0].replace(/\n/g, ' ').trim(),
      author: doc.author ? doc.author[0].name[0] : 'Unknown Author',
      cover: null,
      year: doc.published ? new Date(doc.published[0]).getFullYear() : null,
      formats: ['PDF'],
      source: 'arXiv',
      downloadUrl: doc.id[0],
      type: 'paper'
    }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function fetchStandardEbooks(query) {
  try {
    const res = await fetch(`/api/standardebooks?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    const entries = data.feed?.entry || [];
    const entryArray = Array.isArray(entries) ? entries : [entries];
    return entryArray.map(doc => {
      let cover = null;
      if (doc.link) {
        const imageLink = doc.link.find(l => l.$ && l.$.rel === 'http://opds-spec.org/image');
        if (imageLink) cover = `https://standardebooks.org${imageLink.$.href}`;
      }
      return {
        id: `se_${doc.id[0].replace('url:https://standardebooks.org/ebooks/', '').replace(/\//g, '_')}`,
        title: doc.title[0],
        author: doc.author ? doc.author[0].name[0] : 'Unknown Author',
        cover: cover,
        year: null,
        formats: ['EPUB', 'AZW3', 'KEPUB'],
        source: 'Standard Ebooks',
        downloadUrl: doc.id[0].replace('url:', ''),
        type: 'classic'
      };
    });
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function searchAllSources(query) {
  const cacheKey = `search_${query}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const withTimeout = (promise, ms) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
    ]);
  };

  try {
    const results = await Promise.allSettled([
      withTimeout(fetchOpenLibrary(query), 8000),
      withTimeout(fetchGutenberg(query), 8000),
      withTimeout(fetchArxiv(query), 8000),
      withTimeout(fetchStandardEbooks(query), 8000)
    ]);

    let combined = [];
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        combined = [...combined, ...result.value];
      }
    });

    sessionStorage.setItem(cacheKey, JSON.stringify(combined));
    return combined;
  } catch (e) {
    console.error("Search error", e);
    return [];
  }
}
