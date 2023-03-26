import Product from "../models/product.model.js";
import csv from "csv-parser";
import fs from "fs";
 //hi
export const addProduct = async(req, res, next) => {
    try {
        const data = req.body;

        if(!data) {
            res.send('upload body')
        } else if(!data.ProductName || !data.ProductDescription){
            res.status(409).json({error: "ProductName and Description is must"})
        } else if(!req.file){
            res.status(409).json({error: "please select the csv file to upload the data"});
        } else{
            let arr = [];
            fs.createReadStream(req.file.path).pipe(csv()).on('data', (row) => {
                if(!data._id || !data.attributes || data.rarity){
                    console.log('error in file fields missing')
                }
                let obj = {_id: data._id, attributes: data.attributes, image: data.image, name: data.name, rarity: data.rarity}
                arr.push(obj); 
                // console.log(data)
            }).on('end', () => {
                // console.log(arr)
                console.log('Data uploaded successfully');
                res.status(200).json({message: "Data uploaded successfully"})
            }).on('error', (err) => {
                console.log(err)
            })
        }

    } catch (error) {
        console.log(error)
        res.status(419).json({error: error.message});
    }
}