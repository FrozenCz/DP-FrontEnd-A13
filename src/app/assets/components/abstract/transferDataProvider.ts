import {Observable} from 'rxjs';
import {IAssetsExt} from '../../assets.service';
import {AssetSource} from '../../../facade/facade';
import {Caretaker} from '../../../users/model/caretaker.model';
import {AssetTransfer} from '../../models/asset-transfer.model';
import {Asset} from '../../models/assets.model';

export abstract class TransferDataProvider {
  public abstract getAssetExt(source: AssetSource): Observable<IAssetsExt[]>

  public abstract getAssetExtMap$(source: AssetSource): Observable<Map<number, IAssetsExt>>

  public abstract getCaretakers$(): Observable<Caretaker[]>

  public abstract getCaretaker$(): Observable<Caretaker>

  public abstract getAssetTransfers$(): Observable<AssetTransfer[]>;

  public abstract getAssetTransfer$(uuid: string): Observable<AssetTransfer>;

  public abstract getAssetsMap$(): Observable<Map<number, Asset>>;

  public abstract sendRequestForAssetTransfer(fromUser: number, toUser: number, assetIds: number[], message: string): Observable<void>

  public abstract approveTransfer(uuid: string): Observable<void>

  public abstract rejectTransfer(uuid: string): Observable<void>

  public abstract revertTransfer(uuid: string): Observable<void>

}
