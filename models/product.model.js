import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const productSchema = new mongoose.Schema({
    ProductName: {
        type: String,
        unique: true,
        required: true
    },
    ProductDescription: {
        type: String,
        required: true,
        maxlength: 300,
    },
    ProductData: [
        {
            Image: {
                type: String,
                required: true,
            },
            ProductUrl: {
                type: String,
                required: true
            },
            Price: {
                type: Number,
                required: true,
            },
            Size: {
                type: String
            },
            Color: {
                type: String
            }
        }
    ],
    created_at: {
        type: Date
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    modified_at: {
        type: Date,
    }
});

const Product = mongoose.model('Product', productSchema);

export default Product;