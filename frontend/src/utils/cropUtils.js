export const getCropImage = (crop) => {
  if (crop && crop.image && crop.image !== '' && crop.image !== 'undefined' && crop.image !== 'null') {
    if (crop.image.startsWith('http') || crop.image.startsWith('data:image')) {
      return crop.image;
    }
    // Prefix relative paths with the backend URL and normalize slashes
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${baseUrl}/${crop.image.replace(/\\/g, '/')}`;
  }


  const category = crop.category || 'Other';
  const name = (crop.name || '').toLowerCase();

  const categoryImages = {
    'Vegetable': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Vegetables_in_basket.jpg/400px-Vegetables_in_basket.jpg',
    'Fruit': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Culinary_fruits_front_view.jpg/400px-Culinary_fruits_front_view.jpg',
    'Grain': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Wheat_close-up.JPG/400px-Wheat_close-up.JPG',
    'Cereal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Wheat_close-up.JPG/400px-Wheat_close-up.JPG',
    'Legume': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Various_legumes.jpg/400px-Various_legumes.jpg',
    'Oilseed': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Sunflower_seeds_on_a_white_background.jpg/400px-Sunflower_seeds_on_a_white_background.jpg',
    'Stimulant': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Catha_edulis_001.jpg/400px-Catha_edulis_001.jpg',
    'Cash Crop': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Roasted_coffee_beans.jpg/400px-Roasted_coffee_beans.jpg',
    'Other': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Fresh_produce.jpg/400px-Fresh_produce.jpg'
  };

  // Keyword overrides
  if (name.includes('coffee') || name.includes('buna') || name.includes('cofe')) {
    return categoryImages['Cash Crop'];
  }
  if (name.includes('maize') || name.includes('bokolo') || name.includes('corn')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Corn_on_the_cob.jpg/400px-Corn_on_the_cob.jpg';
  }
  if (name.includes('papaya')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Papaya_cross_section_BNC.jpg/400px-Papaya_cross_section_BNC.jpg';
  }
  if (name.includes('orange')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Ambersweet_oranges.jpg/400px-Ambersweet_oranges.jpg';
  }
  if (name.includes('tomato')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tomato_je.jpg/400px-Tomato_je.jpg';
  }
  if (name.includes('onion')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Onions_on_a_white_background.jpg/400px-Onions_on_a_white_background.jpg';
  }
  if (name.includes('chat') || name.includes('qat')) {
    return categoryImages['Stimulant'];
  }

  return categoryImages[category] || categoryImages['Other'];
};
