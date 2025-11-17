
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
	
	return res.slice(0, limit);
}

export function searchFilter(query, products, priceFilter) {
	const q = query.toLowerCase();
	const nameFiltered = products.filter(i => i.name?.toLowerCase().includes(q));
	if (nameFiltered.length === 0) return [];
	
	const itemPrices = nameFiltered.map(i => i.price).filter(i => typeof i === "number").sort((a,b) => a-b);
	const middle = Math.floor(itemPrices.length / 2);
	
	if (!priceFilter || itemPrices[middle] < 50) return nameFiltered;
	
	let median = itemPrices[middle];
	if (itemPrices.length % 2 === 0) {
		median = (itemPrices[middle-1] + itemPrices[middle]) / 2		
	}

	return nameFiltered.filter(i => i.price >= median * 0.25 && i.price <= median * 3.0);
}