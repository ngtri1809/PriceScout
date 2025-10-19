// @ts-check
import { useState } from 'react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Mock search results
      const mockResults = [
        { id: '1', name: 'PlayStation 5 Console', sku: 'PS5-001', price: 499.99 },
        { id: '2', name: 'iPhone 15 Pro', sku: 'IPHONE-15-001', price: 999.99 },
        { id: '3', name: 'NVIDIA GeForce RTX 4090', sku: 'RTX-4090-001', price: 1599.99 },
      ].filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.sku.toLowerCase().includes(query.toLowerCase())
      );
      
      setResults(mockResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
    className="min-h-screen bg-gray-100 text-gray-800"
    style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", color: "#1f2937", fontFamily: `ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"` }}
  >
    {/* Top Navbar (logo left, links center, avatar right) */}
    <header
      className="sticky top-0 z-50 bg-green-200/80 border-b border-green-300/70 backdrop-blur"
      style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "rgba(187, 247, 208, 0.8)", borderBottom: "1px solid rgba(134, 239, 172, 0.7)", backdropFilter: "saturate(180%) blur(8px)" }}
    >
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between"
        style={{ maxWidth: "80rem", margin: "0 auto", padding: "0 1rem", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <a href="/home.html" className="text-lg font-semibold tracking-tight text-gray-900" style={{ fontWeight: 600, color: "#111827" }}>
          PriceScout
        </a>

        <nav className="flex items-center gap-6 text-sm" style={{ display: "flex", alignItems: "center", gap: "1.5rem", fontSize: "0.875rem" }}>
          <a href="/home.html" className="hover:text-gray-900 text-gray-700" style={{ color: "#374151", textDecoration: "none" }}>Home</a>
          <a href="/search.html" className="font-medium text-gray-900" style={{ fontWeight: 500, color: "#111827", textDecoration: "none" }}>Search</a>
          <a href="/lists.html" className="hover:text-gray-900 text-gray-700" style={{ color: "#374151", textDecoration: "none" }}>Lists</a>
          <a href="/compare.html" className="hover:text-gray-900 text-gray-700" style={{ color: "#374151", textDecoration: "none" }}>Compare</a>
        </nav>

        <div
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-xs"
          style={{ display: "inline-flex", height: "2rem", width: "2rem", alignItems: "center", justifyContent: "center", borderRadius: "9999px", backgroundColor: "#d1d5db", fontSize: "0.75rem" }}
        >
          AB
        </div>
      </div>
    </header>

    {/* Centered hero + results (under 56px navbar) */}
    <main
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-56px)] grid place-items-center"
      style={{ maxWidth: "80rem", margin: "0 auto", padding: "2rem 1rem", minHeight: "calc(100vh - 56px)", display: "grid", placeItems: "center" }}
    >
      {/* Search hero */}
      <section className="w-full max-w-3xl text-center" style={{ width: "100%", maxWidth: "48rem", textAlign: "center" }}>
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900" style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111827" }}>
          Find the best price for any product
        </h1>
        <p className="mt-2 text-gray-600" style={{ marginTop: "0.5rem", color: "#4b5563" }}>
          Paste a product link or type a keyword to compare deals and start tracking
        </p>

        <form onSubmit={handleSearch} className="mt-6 flex items-center gap-3" style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <label htmlFor="search" className="sr-only">Search</label>
          <input
            id="search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Paste a link to your product here"
            className="flex-1 rounded-full border border-gray-300 bg-white px-5 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              flex: 1,
              borderRadius: "9999px",
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              padding: "0.75rem 1.25rem",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
            }}
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-blue-600 px-5 py-3 text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            style={{
              borderRadius: "9999px",
              backgroundColor: loading ? "#2563eb" : "#2563eb",
              color: "#ffffff",
              padding: "0.75rem 1.25rem",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              opacity: loading ? 0.85 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-500" style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#6b7280" }}>
          Try pasting a product URL from major retailers or search by model name
        </div>
      </section>

      {/* Results */}
      <section className="w-full mt-10" style={{ width: "100%", marginTop: "2.5rem" }}>
        {loading && (
          <div className="text-center text-gray-500" style={{ textAlign: "center", color: "#6b7280" }}>
            Searching…
          </div>
        )}

        {!loading && results.length === 0 && query.trim().length > 0 && (
          <div className="text-center text-gray-600" style={{ textAlign: "center", color: "#4b5563" }}>
            No products found for "<span className="font-medium" style={{ fontWeight: 500 }}>{query}</span>"
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
               style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(16rem, 1fr))" }}>
            {results.map((item) => (
              <article
                key={item.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                style={{ borderRadius: "0.5rem", border: "1px solid #e5e7eb", backgroundColor: "#ffffff", padding: "1rem", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
              >
                <h3 className="font-semibold text-gray-900" style={{ fontWeight: 600, color: "#111827" }}>{item.name}</h3>
                <p className="text-sm text-gray-500 mt-1" style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>
                  SKU: {item.sku}
                </p>
                <p className="text-sm text-gray-900 mt-2" style={{ fontSize: "0.95rem", color: "#111827", marginTop: "0.5rem" }}>
                  ${item.price.toFixed(2)}
                </p>
                <div className="mt-3" style={{ marginTop: "0.75rem" }}>
                  <a
                    href={`/item.html?id=${encodeURIComponent(item.id)}`}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                    style={{ color: "#2563eb", textDecoration: "none", fontSize: "0.875rem" }}
                  >
                    View details
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  </div>
  );
}
