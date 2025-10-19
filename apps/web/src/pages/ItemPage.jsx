// @ts-check
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function ItemPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock item data
    const mockItem = {
      id: id,
      name: 'PlayStation 5 Console',
      sku: 'PS5-001',
      description: 'Next-generation gaming console with 4K gaming and ray tracing',
      category: 'Gaming',
      price: 499.99
    };
    
    setItem(mockItem);
    setLoading(false);
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!item) {
    return <div className="text-center py-8">Item not found</div>;
  }

  return (
    <div
    className="min-h-screen bg-gray-100 text-gray-800"
    style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", color: "#1f2937", fontFamily: `ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"` }}
  >
    {/* Top Navbar */}
    <header
      className="sticky top-0 z-50 bg-green-200/80 border-b border-green-300/70 backdrop-blur"
      style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "rgba(187, 247, 208, 0.8)", borderBottom: "1px solid rgba(134,239,172,0.7)", backdropFilter: "saturate(180%) blur(8px)" }}
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
          <a href="/search.html" className="hover:text-gray-900 text-gray-700" style={{ color: "#374151", textDecoration: "none" }}>Search</a>
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

    {/* Below navbar: center content; show loading or item */}
    <main
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-56px)] grid place-items-center"
      style={{ maxWidth: "80rem", margin: "0 auto", padding: "2rem 1rem", minHeight: "calc(100vh - 56px)", display: "grid", placeItems: "center" }}
    >
      {(loading || !item) ? (
        <div className="text-center text-gray-500" style={{ textAlign: "center", color: "#6b7280" }}>
          Loading item…
        </div>
      ) : (
        <section className="w-full max-w-5xl">
          {/* Header info */}
          <div className="rounded-2xl bg-white shadow p-6" style={{ borderRadius: "1rem", backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", padding: "1.5rem" }}>
            <div className="grid gap-6 md:grid-cols-2" style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
              {/* Image placeholder */}
              <div className="flex items-center justify-center" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="aspect-[4/3] w-64 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center"
                     style={{ width: "16rem", aspectRatio: "4 / 3", borderRadius: "0.5rem", backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="text-gray-400" style={{ color: "#9ca3af" }}>Product Image</span>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "1rem" }}>
                <div className="col-span-2">
                  <div className="text-sm text-gray-500" style={{ fontSize: "0.875rem", color: "#6b7280" }}>Product</div>
                  <h1 className="text-xl font-semibold text-gray-900" style={{ fontSize: "1.25rem", fontWeight: 600, color: "#111827" }}>
                    {item.name}
                  </h1>
                </div>

                <div>
                  <div className="text-sm text-gray-500" style={{ fontSize: "0.875rem", color: "#6b7280" }}>SKU</div>
                  <div className="font-medium text-gray-900" style={{ fontWeight: 500, color: "#111827" }}>{item.sku}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500" style={{ fontSize: "0.875rem", color: "#6b7280" }}>Category</div>
                  <div className="font-medium text-gray-900" style={{ fontWeight: 500, color: "#111827" }}>{item.category}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500" style={{ fontSize: "0.875rem", color: "#6b7280" }}>Current Price</div>
                  <div className="text-lg font-semibold text-gray-900" style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827" }}>
                    ${item.price.toFixed(2)}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500" style={{ fontSize: "0.875rem", color: "#6b7280" }}>Item ID</div>
                  <div className="font-medium text-gray-900" style={{ fontWeight: 500, color: "#111827" }}>{item.id}</div>
                </div>

                <div className="col-span-2">
                  <div className="text-sm text-gray-500" style={{ fontSize: "0.875rem", color: "#6b7280" }}>Description</div>
                  <p className="text-gray-700" style={{ color: "#374151" }}>{item.description}</p>
                </div>
              </div>
            </div>

           
            {/* Chart placeholder 
            <div className="mt-8">
              <div className="text-sm text-gray-600 mb-2" style={{ fontSize: "0.875rem", color: "#4b5563", marginBottom: "0.5rem" }}>Price history</div>
              <svg viewBox="0 0 400 120" className="w-full h-28" style={{ width: "100%", height: "7rem" }}>
                <polyline fill="none" stroke="#111827" strokeWidth="2"
                          points="10,90 50,60 90,70 130,65 170,95 210,80 250,55 290,35 330,25 370,15" />
                <line x1="10" y1="100" x2="390" y2="100" stroke="#e5e7eb" />
              </svg>
            </div>
            */}

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row" style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button
                onClick={() => alert("Added to list")}
                className="flex-1 rounded-md bg-gray-800 px-4 py-2 text-white hover:bg-gray-900"
                style={{ flex: 1, borderRadius: "0.375rem", backgroundColor: "#1f2937", color: "#fff", padding: "0.5rem 1rem" }}
              >
                Add to List
              </button>
              <button
                onClick={() => alert("Prediction requested")}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                style={{ flex: 1, borderRadius: "0.375rem", backgroundColor: "#2563eb", color: "#fff", padding: "0.5rem 1rem" }}
              >
                Predict Future Prices
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
                style={{ flex: 1, borderRadius: "0.375rem", backgroundColor: "#e5e7eb", color: "#1f2937", padding: "0.5rem 1rem" }}
              >
                Refresh Information
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  </div>
  );
}
