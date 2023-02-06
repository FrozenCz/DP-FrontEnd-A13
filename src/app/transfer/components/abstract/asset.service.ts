import {Observable} from 'rxjs';
import {IAssetsExt} from '../../../assets/assets.service';
import {AssetSource} from '../../../facade/facade';

export abstract class AssetService {
  public abstract getAssetExt(source: AssetSource): Observable<IAssetsExt[]>

}
