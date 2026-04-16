export const getCropImage = (crop) => {
  if (crop && crop.image && crop.image !== '' && crop.image !== 'undefined' && crop.image !== 'null') {
    if (crop.image.startsWith('http') || crop.image.startsWith('data:image')) {
      return crop.image;
    }
    // Prefix relative paths with the backend URL and normalize slashes
    return `http://localhost:5000/${crop.image.replace(/\\/g, '/')}`;
  }


  const category = crop.category || 'Other';
  const name = (crop.name || '').toLowerCase();

  const categoryImages = {
    'Vegetable': 'https://images.unsplash.com/photo-1566385101042-1a0aa0c12e8c?auto=format&fit=crop&q=80&w=400',
    'Fruit': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=400',
    'Grain': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400',
    'Cereal': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400',
    'Legume': 'https://images.unsplash.com/photo-1515544832971-daac5775836c?auto=format&fit=crop&q=80&w=400',
    'Oilseed': 'https://images.unsplash.com/photo-1464454709131-ffd692591ee5?auto=format&fit=crop&q=80&w=400',
    'Stimulant': 'https://images.unsplash.com/photo-1495924979005-79104481a52f?auto=format&fit=crop&q=80&w=400',
    'Cash Crop': 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=400',
    'Other': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'
  };

  // Keyword overrides
  if (name.includes('coffee') || name.includes('buna') || name.includes('cofe')) {
    return categoryImages['Cash Crop'];
  }
  if (name.includes('maize') || name.includes('bokolo')) {
    return categoryImages['Grain'];
  }
  if (name.includes('papaya') || name.includes('orange')) {
    return categoryImages['Fruit'];
  }
  if (name.includes('tomato') || name.includes('onion')) {
    return categoryImages['Vegetable'];
  }
  if (name.includes('chat') || name.includes('qat')) {
    return categoryImages['Stimulant'];
  }

  return categoryImages[category] || categoryImages['Other'];
};
