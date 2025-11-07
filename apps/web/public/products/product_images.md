# Product Images Directory

This directory contains product images for the 17 SKUs with Prophet price predictions.

## Naming Convention

Please name image files to match the product names (lowercase with underscores):

```
alarm_clock_bakelike_green.jpg
alarm_clock_bakelike_red.jpg
cake_cases.jpg
glass_hanging_t_light.jpg
hand_warmer_red.jpg
heart_chalkboard.jpg
jam_making_set.jpg
jumbo_bag_red.jpg
jumbo_storage_bag_suki.jpg
lunch_bag_cars_blue.jpg
lunch_bag_pink_polkadot.jpg
lunch_bag_red_retrospot.jpg
lunch_bag_spaceboy_design.jpg
party_bunting.jpg
white_hanging_t_light_holder.jpg
wooden_picture_frame.jpg
woodland_charlotte_bag.jpg
```

## Supported Formats
- `.jpg` or `.jpeg`
- `.png`
- `.webp`

## Recommended Image Specs
- **Resolution**: 800x800px (square)
- **File size**: < 200KB per image
- **Format**: JPEG (for photos) or PNG (for graphics with transparency)

## Usage in React

```jsx
// Simple usage
<img src="/products/alarm_clock_bakelike_green.jpg" alt="Alarm Clock" />

// With helper function
import { getProductImagePath } from '../utils/product-helpers';

<img 
  src={getProductImagePath("alarm clock bakelike green")} 
  alt="Alarm Clock Bakelike Green"
/>
```

## Notes
- Files in `/public` are served directly by Vite
- Access images via `/products/filename.jpg` in your components
- Vite automatically optimizes images during build
