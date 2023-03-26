import express from 'express';
import multer from 'multer';
import { addProduct } from '../controllers/product.controller.js';

var upload = multer({dest: 'uploads', fileFilter: function(req, file, cb){
    console.log('file is', file)
    cb(null, true);
}})

const router = express.Router();

router.post('/upload',upload.single('csv'), addProduct);

export default router;