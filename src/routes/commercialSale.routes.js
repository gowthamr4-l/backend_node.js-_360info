const express = require('express');
const router = express.Router();
const controller = require('../controllers/commercialSale.controller');
const upload = require('../config/multer');

router.post('/', controller.createProperty);
router.get('/', controller.getAllProperties);
router.get('/user/:userId', controller.getPropertiesByUser);
router.get('/:id', controller.getPropertyById);
router.put('/:id', controller.updateProperty);
router.delete('/:id', controller.deleteProperty);

router.post('/:propertyId/photos', upload.array('photos', 9), controller.uploadPhotos);
router.get('/:propertyId/photos', controller.getPhotos);
router.put('/:propertyId/photos/reorder', controller.reorderPhotos);
router.delete('/photos/:photoId', controller.deletePhoto);

module.exports = router;
