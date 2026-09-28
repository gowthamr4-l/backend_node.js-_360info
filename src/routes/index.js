const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes');
const authRoutes = require('./auth.routes');
const feedRoutes = require('./feed.routes');

const residentialRentRoutes = require('./residentialRent.routes');
const residentialResaleRoutes = require('./residentialResale.routes');
const residentialPgRoutes = require('./residentialPg.routes');
const commercialRentRoutes = require('./commercialRent.routes');
const commercialSaleRoutes = require('./commercialSale.routes');
const landPlotResaleRoutes = require('./landPlotResale.routes');
const leadRoutes = require('./lead.routes');
const supportRoutes = require('./support.routes');

// Mount feed / pagination routes
router.use('/feed', feedRoutes);
router.use('/properties/feed', feedRoutes);
router.use('/properties-all', feedRoutes);

// Mount user and auth routes
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);
router.use('/support', supportRoutes);
router.use('/contact', supportRoutes);

// Mount property routes and intuitive aliases
router.use('/properties', residentialRentRoutes);
router.use('/residential-rent', residentialRentRoutes);
router.use('/property', residentialRentRoutes);

router.use('/residential-resale', residentialResaleRoutes);
router.use('/residential-pg', residentialPgRoutes);
router.use('/pg', residentialPgRoutes);

router.use('/commercial-rent', commercialRentRoutes);
router.use('/commercial-sale', commercialSaleRoutes);
router.use('/commercial-sales', commercialSaleRoutes);

router.use('/land-plot', landPlotResaleRoutes);
router.use('/land-plots', landPlotResaleRoutes);

module.exports = router;
