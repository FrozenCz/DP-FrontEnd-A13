import {Asset} from '../assets/models/assets.model';
import {User} from '../users/model/user.model';
import {Category} from '../categories/models/category.model';
import {IAssetsExt} from '../assets/assets.service';
import {Location} from '../locations/model/location';

export class Transforms {

  private constructor() {}

  public static getAssetModelExt(asset: Asset, users: Map<number, User>, categories: Map<number, Category>, locations: Map<string, Location>): IAssetsExt {
    const category = categories.get(asset.category_id);
    const userIn = users.get(asset.user_id);

    let locationIn;

    if (asset.location_id) {
      locationIn = locations.get(asset.location_id);
    }

    if (!category) {
      throw new Error('Category ID not found')
    }

    if (!userIn) {
      throw new Error('User id not found');
    }

    return {
      categories: category.tree,
      id: asset.id,
      asset: {
        id: asset.id,
        category: {
          name: category.name,
          id: category.id
        },
        name: asset.name,
        quantity: asset.quantity,
        user: userIn,
        serialNumber: asset.serialNumber,
        inventoryNumber: asset.inventoryNumber,
        evidenceNumber: asset.evidenceNumber,
        identificationNumber: asset.identificationNumber,
        inquiryDate: asset.inquiryDate,
        document: asset.document,
        inquiryPrice: asset.inquiryPrice,
        location: locationIn ?? null,
        locationEtc: asset.locationEtc,
        note: asset.note,
        state: asset.state,
      }
    }
  }



}
