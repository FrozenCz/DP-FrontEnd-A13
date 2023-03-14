import {Asset} from '../assets/models/assets.model';
import {User} from '../users/model/user.model';
import {Category} from '../categories/models/category.model';
import {IAssetsExt} from '../assets/assets.service';
import {Location} from '../locations/model/location';
import {LocationDto} from '../locations/dto/in/location.dto';
import {NotFoundError} from 'rxjs';
import {AssetTransfer, AssetTransferDto} from '../assets/models/asset-transfer.model';
import {StockTaking, StockTakingItem} from '../assets/stock-taking.service';
import {StockTakingForList} from '../assets/components/stock-taking-list/stockTakingListProvider';
import {map} from 'rxjs/operators';

export abstract class Transforms {

  private constructor() {
  }

  public static getAssetModelExt(asset: Asset, users: Map<number, User>, categories: Map<number, Category>, locations: Map<string, Location>): IAssetsExt {
    const category = categories.get(asset.category_id);
    const userIn = users.get(asset.user_id);

    let locationIn;

    if (asset.location_uuid) {
      locationIn = locations.get(asset.location_uuid);
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
        attachments: asset.attachments
      }
    }
  }


  public static getLocationFromDto(locationDto: LocationDto, locations: Map<string, Location>): Location {
    let parent = null;
    if (locationDto.parent_uuid) {
      parent = locations.get(locationDto.parent_uuid);
      if (!parent) {
        throw new NotFoundError('Parent not found ' + locationDto.parent_uuid);
      }
    }
    return new Location(locationDto.uuid, locationDto.name, parent);
  }

  static assetsTransferDto(assetsTransferDto: AssetTransferDto): AssetTransfer {
    const {
      assets,
      caretakerFrom,
      caretakerTo,
      uuid,
      createdAt,
      rejectedAt,
      revertedAt,
      acceptedAt,
      message
    } = assetsTransferDto;
    return {
      message,
      assets,
      caretakerFrom,
      caretakerTo,
      uuid,
      createdAt: new Date(createdAt),
      rejectedAt: rejectedAt ? new Date(rejectedAt) : null,
      revertedAt: revertedAt ? new Date(revertedAt) : null,
      acceptedAt: acceptedAt ? new Date(acceptedAt) : null
    };
  }

  public static getStockTakingsForList(
    params: {
      stockTakings: StockTaking[],
      usersMap: Map<number, User>,
      assetsMap: Map<number, Asset>
    }): StockTakingForList[] {
    const {stockTakings, usersMap, assetsMap} = params;
    return stockTakings.map(stockTaking => this.getStockTakingForList({stockTaking, usersMap, assetsMap}));
  }

  private static getStockTakingForList(param: { stockTaking: StockTaking; assetsMap: Map<number, Asset>; usersMap: Map<number, User> }): StockTakingForList {
    const {stockTaking, usersMap, assetsMap} = param;
    const author = usersMap.get(stockTaking.authorId);
    const solver = usersMap.get(stockTaking.solverId);

    if (!author || !solver) {
      throw new Error('Solver or Author not found');
    }

    const foundPercentage = this.getFoundPercentage(stockTaking);

    return {
      ...stockTaking,
      items: stockTaking.items.length,
      lastUpdateAt: null,
      authorName: author.fullName,
      solverName: solver.fullName,
      foundPercentage
    }
  }

  private static getFoundPercentage(stockTaking: StockTaking) {
    return stockTaking.items.length ? (stockTaking.items.filter(item => item.foundAt).length / stockTaking.items.length) : 0;
  }

  // private static getStockTakingItems(params: { items: StockTakingItem[], assetsMap: Map<number, Asset> }): StockTakingListItem[] {
  //   const {items, assetsMap} = params;
  //   return items.map(item => this.getStockTakingItem(assetsMap, item));
  // }


  // private static getStockTakingItem(assetsMap: Map<number, Asset>, item: StockTakingItem) {
  //   const found = assetsMap.get(item.assetId);
  //   if (!found) {
  //     throw new Error('Asset not found');
  //   }
  //
  //   return {
  //     name: found.name,
  //     uuid: item.uuid,
  //     ec: found.evidenceNumber,
  //     ic: found.inventoryNumber,
  //     assetId: item.assetId
  //   }
  // }
}
