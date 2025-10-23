const express = require('express');
const router = express.Router();
const { getHomePage,
    getCrudform,
    postCrudform,
    displayCrud,
    updateUser,
    putCrud,
    deleteCrud
} = require('../controller/homeController');

// Home page route
router.get('/', getHomePage);
router.get('/crud-form', getCrudform);
router.post('/post-crud', postCrudform);
router.get('/display-crud', displayCrud);
router.get('/update-user', updateUser);
router.post('/put-crud', putCrud);
router.get('/delete-crud', deleteCrud);
module.exports = router;