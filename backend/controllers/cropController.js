const Crop = require('../models/Crop');

// @desc    Get all available crops (with optional filters)
// @route   GET /api/crops
// @access  Public
const getCrops = async (req, res) => {
  try {
    const { keyword, category, location } = req.query;
    
    // Filtering logic
    const filter = { isAvailable: true };
    if (keyword) {
      filter.name = { $regex: keyword, $options: 'i' };
    }
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };

    const crops = await Crop.find(filter).populate('farmer', 'name location mpesaNumber');
    res.json(crops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single crop
// @route   GET /api/crops/:id
// @access  Public
const getCropById = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id).populate('farmer', 'name email location mpesaNumber');
    
    if (crop) {
      res.json(crop);
    } else {
      res.status(404).json({ message: 'Crop not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a crop listing
// @route   POST /api/crops
// @access  Private (Farmer only)
const createCrop = async (req, res) => {
  try {
    if (req.user.role !== 'Farmer' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only farmers can create crop listings' });
    }

    const { name, category, quantity, unit, pricePerUnit, location, description, image } = req.body;

    const crop = new Crop({
      farmer: req.user._id,
      name,
      category,
      quantity,
      unit,
      pricePerUnit,
      location,
      description,
      image,
      isAvailable: true
    });

    const createdCrop = await crop.save();
    res.status(201).json(createdCrop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a crop listing
// @route   PUT /api/crops/:id
// @access  Private (Farmer)
const updateCrop = async (req, res) => {
  try {
    const { name, category, quantity, unit, pricePerUnit, location, description, image, isAvailable } = req.body;

    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    // Ensure only the farmer who owns it (or admin) can update
    if (crop.farmer.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to update this crop' });
    }

    crop.name = name || crop.name;
    crop.category = category || crop.category;
    crop.quantity = quantity || crop.quantity;
    crop.unit = unit || crop.unit;
    crop.pricePerUnit = pricePerUnit || crop.pricePerUnit;
    crop.location = location || crop.location;
    crop.description = description || crop.description;
    crop.image = image || crop.image;
    
    if (isAvailable !== undefined) {
      crop.isAvailable = isAvailable;
    }

    const updatedCrop = await crop.save();
    res.json(updatedCrop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a crop listing
// @route   DELETE /api/crops/:id
// @access  Private (Farmer)
const deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    // Ensure only the farmer who owns it (or admin) can delete
    if (crop.farmer.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to delete this crop' });
    }

    await crop.deleteOne();
    res.json({ message: 'Crop removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCrops,
  getCropById,
  createCrop,
  updateCrop,
  deleteCrop
};
