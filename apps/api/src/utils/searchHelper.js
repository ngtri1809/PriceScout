
export function cleanResults(engine, results, limit) {
	let res = [];
	if (engine === "google_shopping") {
		res = (results.shopping_results || []).map(item => ({
		  name: item.title,
		  source: item.source || "Google Shopping",
		  price: item.extracted_price || null,
		  product_link: item.link || null,
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
		  price: item.price?.value || null,
		  product_link: item.link || null,
		  thumbnail: item.thumbnail || null,
		  rating: item.rating || null,
		  reviews: item.reviews || null
		}));
	}
	
	return res.slice(0, limit);
}