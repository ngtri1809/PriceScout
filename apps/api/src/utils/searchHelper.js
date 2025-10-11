
export function cleanResults(engine, results, limit) {
	let res = [];
	if (engine === "google_shopping") {
		res = (results.shopping_results || []).map(item => ({
		  name: item.title,
		  source: item.source || "Google Shopping",
		  price: item.extracted_price || null,
		  product_link: item.product_link || null,
		  thumbnail: item.thumbnail,
		  rating: item.rating || null,
		  reviews: item.reviews || null
		}));
	  }

	if (engine === "amazon") {
		res = (results.organic_results || []).map(item => ({
		  name: item.title,
		  source: "Amazon",
		  price: item.extracted_price || null,
		  product_link: item.link_clean || item.link || null, 
		  thumbnail: item.thumbnail,
		  rating: item.rating || null,
		  reviews: item.reviews || null			
		}));
	}
	
	if (engine === "ebay") {
		res = (results.organic_results || results.shopping_results || []).map(item => ({
		  name: item.title,
		  source: "eBay",
		  price: parseFloat((item.price?.raw || "").replace(/[^0-9.]/g, "")) || null,
		  product_link: item.link || null,
		  thumbnail: item.thumbnail || null,
		  rating: item.seller_rating || item.rating || null,
		  reviews: item.seller_reviews || item.reviews || null
		}));
	}
	
	res.sort((a,b) => {
		if (a.price == null) return 1;
		if (b.price ==null) return -1;
		return a.price - b.price;
	});
	
	return res.slice(0, limit);
}