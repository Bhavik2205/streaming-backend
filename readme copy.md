Currently the product creation API doesnot allow user to create inventory simultaneously so need to update the API in such a way that if user wants to create the inventory while creating the product document.

create the inventory while creating the product document.


//Task 1
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { IInventoryDocument } from '@inventory/interfaces/inventory.interface';
import { inventoryQueue } from '../../../shared/services/queues/inventory.queue';
import { updateInventorySchema } from '@inventory/schemes/inventory';

export class Update {
  @joiValidation(updateInventorySchema)
  public async inventory(req: Request, res: Response): Promise<void> {
    const inventoryId: ObjectId = new ObjectId(req.params.id);
    const { productId, productColor, productSize, productQuantity } = req.body;
    const inventoryData: IInventoryDocument = {
      _id: inventoryId,
      productId,
      productColor,
      productSize,
      productQuantity,
      updatedAt: new Date()
    } as IInventoryDocument;
    inventoryQueue.addInventoryJob('updateInventoryJob', inventoryData);
    res.status(HTTP_STATUS.OK).json({ message: 'Inventory updated successfully' });
  }
}


//Task 2
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { IProductDocument } from '@product/interfaces/product.interface';
import { IInventoryDocument } from '@inventory/interfaces/inventory.interface';
import { productQueue } from '../../../shared/services/queues/product.queue';
import { inventoryQueue } from '../../../shared/services/queues/inventory.queue';
import { addProductSchema } from '@product/schemes/product';
import { addInventorySchema } from '@inventory/schemes/inventory';

export class Add {
  @joiValidation(addProductSchema)
  public async product(req: Request, res: Response): Promise<void> {
    const { name, description, price, quantity, color, size } = req.body;

    // Create the product document
    const productObjectId: ObjectId = new ObjectId();
    const productData: IProductDocument = {
      _id: productObjectId,
      name,
      description,
      price,
      quantity,
      createdAt: new Date(),
    } as IProductDocument;

    // Create the inventory document if provided in the request body
    if (color && size && quantity) {
      const inventoryObjectId: ObjectId = new ObjectId();
      const inventoryData: IInventoryDocument = {
        _id: inventoryObjectId,
        productId: productObjectId,
        productColor: color,
        productSize: size,
        productQuantity: quantity,
        createdAt: new Date(),
      } as IInventoryDocument;

      inventoryQueue.addInventoryJob('addInventoryJob', inventoryData);
    }

    // Add the product document to the product queue
    productQueue.addProductJob('addProductJob', productData);

    // Send the response to the client
    res.status(HTTP_STATUS.OK).json({ message: 'Product created successfully' });
  }
}
