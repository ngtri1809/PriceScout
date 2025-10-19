/**
 * Convert product name to image filename
 * @param {string} productName - Product name (e.g., "alarm clock bakelike green")
 * @returns {string} Image path (e.g., "/products/alarm_clock_bakelike_green.jpg")
 */
export function getProductImagePath(productName) {
  // Convert product name to lowercase and replace spaces with underscores
  const filename = productName.toLowerCase().replace(/\s+/g, '_');
  return `/products/${filename}.jpg`;
}

/**
 * Get product display name (formatted for UI)
 * @param {string} productName - Product name
 * @returns {string} Formatted product name
 */
export function formatProductName(productName) {
  return productName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Product catalog with metadata
 */
export const PRODUCT_CATALOG = [
  {
    id: 'heart_chalkboard',
    name: 'Heart Chalkboard',
    image: '/products/heart_chalkboard.jpg',
    category: 'Home Decor'
  },
  {
    id: 'alarm_clock_bakelike_green',
    name: 'alarm clock bakelike green',
    image: '/products/alarm_clock_bakelike_green.jpg',
    category: 'Home & Garden'
  },
  {
    id: 'alarm_clock_bakelike_red',
    name: 'alarm clock bakelike red',
    image: '/products/alarm_clock_bakelike_red.jpg',
    category: 'Home & Garden'
  },
  {
    id: 'cake_cases',
    name: 'Cake Cases',
    image: '/products/cake_cases.jpg',
    category: 'Kitchen'
  },
  {
    id: 'glass_hanging_t_light',
    name: 'Glass Hanging T Light',
    image: '/products/glass_hanging_t_light.jpg',
    category: 'Home Decor'
  },
  {
    id: 'hand_warmer_red',
    name: 'hand warmer red',
    image: '/products/hand_warmer_red.jpg',
    category: 'Accessories'
  },
  {
    id: 'jam_making_set',
    name: 'Jam Making Set',
    image: '/products/jam_making_set.jpg',
    category: 'Kitchen'
  },
  {
    id: 'jumbo_bag_red',
    name: 'Jumbo Bag Red',
    image: '/products/jumbo_bag_red.jpg',
    category: 'Storage'
  },
  {
    id: 'jumbo_storage_bag_suki',
    name: 'Jumbo Storage Bag Suki',
    image: '/products/jumbo_storage_bag_suki.jpg',
    category: 'Storage'
  },
  {
    id: 'lunch_bag_cars_blue',
    name: 'Lunch Bag Cars Blue',
    image: '/products/lunch_bag_cars_blue.jpg',
    category: 'Bags'
  },
  {
    id: 'lunch_bag_pink_polkadot',
    name: 'Lunch Bag Pink Polkadot',
    image: '/products/lunch_bag_pink_polkadot.jpg',
    category: 'Bags'
  },
  {
    id: 'lunch_bag_red_retrospot',
    name: 'Lunch Bag Red Retrospot',
    image: '/products/lunch_bag_red_retrospot.jpg',
    category: 'Bags'
  },
  {
    id: 'lunch_bag_spaceboy_design',
    name: 'Lunch Bag Spaceboy Design',
    image: '/products/lunch_bag_spaceboy_design.jpg',
    category: 'Bags'
  },
  {
    id: 'party_bunting',
    name: 'Party Bunting',
    image: '/products/party_bunting.jpg',
    category: 'Party Supplies'
  },
  {
    id: 'white_hanging_t_light_holder',
    name: 'White Hanging t-light Holder',
    image: '/products/white_hanging_t_light_holder.jpg',
    category: 'Home Decor'
  },
  {
    id: 'wooden_picture_frame',
    name: 'Wooden Picture Frame',
    image: '/products/wooden_picture_frame.jpg',
    category: 'Home Decor'
  },
  {
    id: 'woodland_charlotte_bag',
    name: 'Woodland Charlotte Bag',
    image: '/products/woodland_charlotte_bag.jpg',
    category: 'Bags'
  }
];
