import {Observable} from 'rxjs';
import {IAssetsExt} from '../../assets.service';
import {AssetSource} from '../../../facade/facade';
import {Caretaker} from '../../../users/model/caretaker.model';
import {AssetTransfer} from '../../models/asset-transfer.model';

export abstract class TransferDataProvider {
  public abstract getAssetExt(source: AssetSource): Observable<IAssetsExt[]>

  public abstract getCaretakers$(): Observable<Caretaker[]>

  public abstract getCaretaker$(): Observable<Caretaker>

  public abstract getAssetTransfers$(): Observable<AssetTransfer[]>;

  public abstract sendRequestForAssetTransfer(fromUser: number, toUser: number, assetIds: number[], message: string): Observable<void>

}
