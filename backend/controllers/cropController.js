const Crop = require('../models/Crop');
const { analyzePrice } = require('../utils/priceAnalyzer');

// @desc    Get all available crops (with optional filters)
// @route   GET /api/crops
// @access  Public
const getCrops = async (req, res) => {
  try {
    const { keyword, category, location } = req.query;
    
    const filter = { isAvailable: true };
    if (keyword) filter.name = { $regex: keyword, $options: 'i' };
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };

    const crops = await Crop.find(filter)
      .populate('farmer', 'name location phone mpesaNumber')
      .sort({ createdAt: -1 })
      .lean(); // Use lean() to get plain JS objects

    // Attach AI Pricing Analysis to each crop
    const cropsWithAI = crops.map(crop => ({
      ...crop,
      aiAnalysis: analyzePrice(crop.name, crop.pricePerUnit)
    }));

    res.json(cropsWithAI);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get crops for the logged-in farmer
// @route   GET /api/crops/farmer/mycrops
// @access  Private (Farmer)
const getFarmerCrops = async (req, res) => {
  try {
    const crops = await Crop.find({ farmer: req.user._id }).sort({ createdAt: -1 });
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
    const crop = await Crop.findById(req.params.id)
      .populate('farmer', 'name email location phone mpesaNumber');
    
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

    const { name, category, quantity, unit, pricePerUnit, location, description } = req.body;
    
    // Handle image: use Cloudinary URL if available, else skip
    let image = req.body.image || '';
    if (req.files && req.files.length > 0) {
      // Cloudinary storage sets path; memory storage has buffer
      image = req.files[0].path || '';
    }

    const crop = new Crop({
      farmer: req.user._id,
      name,
      category,
      quantity: Number(quantity),
      unit,
      pricePerUnit: Number(pricePerUnit),
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
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    if (crop.farmer.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to update this crop' });
    }

    const { name, category, quantity, unit, pricePerUnit, location, description, isAvailable } = req.body;

    crop.name = name || crop.name;
    crop.category = category || crop.category;
    if (quantity !== undefined) crop.quantity = Number(quantity);
    crop.unit = unit || crop.unit;
    if (pricePerUnit !== undefined) crop.pricePerUnit = Number(pricePerUnit);
    crop.location = location || crop.location;
    crop.description = description || crop.description;
    if (req.files && req.files.length > 0) crop.image = req.files[0].path || crop.image;
    if (isAvailable !== undefined) crop.isAvailable = isAvailable === 'true' || isAvailable === true;

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

    if (crop.farmer.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to delete this crop' });
    }

    await crop.deleteOne();
    res.json({ message: 'Crop removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCrops,
  getFarmerCrops,
  getCropById,
  createCrop,
  updateCrop,
  deleteCrop
};
