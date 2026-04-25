export const getCropImage = (crop) => {
  if (crop && crop.image && crop.image !== '' && crop.image !== 'undefined' && crop.image !== 'null') {
    if (crop.image.startsWith('http') || crop.image.startsWith('data:image')) {
      return crop.image;
    }
    // Prefix relative paths with the backend URL and normalize slashes
    let baseUrl = import.meta.env.VITE_API_URL || '';
    if (baseUrl && baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
    
    const imagePath = crop.image.replace(/\\/g, '/');
    const fullPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    return baseUrl ? `${baseUrl}${fullPath}` : fullPath;
  }


  const category = crop.category || 'Other';
  const name = (crop.name || '').toLowerCase();

  const categoryImages = {
    'Vegetable': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
    'Fruit': 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400',
    'Grain': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    'Cereal': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    'Legume': 'https://images.unsplash.com/photo-1515589053088-75c1fc16dcc6?w=400',
    'Oilseed': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
    'Stimulant': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
    'Cash Crop': 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
    'Other': 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400'
  };

  // Keyword overrides
  if (name.includes('coffee') || name.includes('buna') || name.includes('cofe') || name.includes('coffe')) {
    return categoryImages['Cash Crop'];
  }
  if (name.includes('maize') || name.includes('bokolo') || name.includes('corn')) {
    return 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400';
  }
  if (name.includes('papaya')) {
    return 'https://images.unsplash.com/photo-1617112848923-cc2234394a8a?w=400';
  }
  if (name.includes('orange')) {
    return 'https://images.unsplash.com/photo-1611080661282-8418bd61c5cb?w=400';
  }
  if (name.includes('tomato')) {
    return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400';
  }
  if (name.includes('onion')) {
    return 'https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?w=400';
  }
  if (name.includes('chat') || name.includes('qat')) {
    return categoryImages['Stimulant'];
  }

  return categoryImages[category] || categoryImages['Other'];
};
