import {Observable} from 'rxjs';
import {IAssetsExt} from '../../../assets/assets.service';
import {AssetSource} from '../../../facade/facade';
import {Caretaker} from '../../../users/model/caretaker.model';

export abstract class TransferDataProvider {
  public abstract getAssetExt(source: AssetSource): Observable<IAssetsExt[]>

  public abstract getCaretakers$(): Observable<Caretaker[]>

  public abstract getCaretaker$(): Observable<Caretaker>

  public abstract sendRequestForAssetTransfer(fromUser: number, toUser: number, assetIds: number[], message: string): Observable<void>

}
