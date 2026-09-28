const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/property.controller');
const photoController = require('../controllers/photo.controller');
const upload = require('../config/multer');
const { authenticateToken, optionalAuth } = require('../middlewares/auth.middleware');

// ==================== Property Routes ====================

// Create a new residential rent property
router.post('/', optionalAuth, propertyController.createProperty);

// Get all properties for a specific user
router.get('/user/:userId', optionalAuth, propertyController.getPropertiesByUser);

// Get a single property by ID (with photos)
router.get('/:id', propertyController.getPropertyById);

// Update a property by ID
router.put('/:id', optionalAuth, propertyController.updateProperty);

// Delete a property by ID
router.delete('/:id', optionalAuth, propertyController.deleteProperty);

// ==================== Photo Routes ====================

// Upload photos for a property (max 9 at a time, field name: 'photos')
router.post('/:propertyId/photos', upload.array('photos', 9), photoController.uploadPhotos);

// Get all photos for a property
router.get('/:propertyId/photos', photoController.getPhotos);

// Reorder photos for a property
router.put('/:propertyId/photos/reorder', photoController.reorderPhotos);

// Delete a single photo by photo ID
router.delete('/photos/:photoId', photoController.deletePhoto);

module.exports = router;
