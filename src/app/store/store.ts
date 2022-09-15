import {firstValueFrom, Observable, ReplaySubject} from 'rxjs';
import {map} from 'rxjs/operators';

/**
 * store umi vytvaret replaySubjecty, ktere emituji az kdyz mají naplnenou hodnotu, v pripadě ze je
 * treba pouzit i s vychozim prazdnym polem, tak se muze pri tvorbe tridy vlozit prazdne pole
 * bude umet vratit pole, mapu, jedince vse v $
 * bude umoznovat update, kde pokud je znamena update, pokud ne tak je insert, a bude umet remove
 * zmeny pujde delat i hromadne
 */
export class Store<T> {
  private _$innerStore: ReplaySubject<Map<any, T>> = new ReplaySubject<Map<any, T>>(1);
  private _identifierName: keyof T = 'uuid' as keyof T;

  constructor(config?: { identifierName?: string }, initialData?: T[]) {
    if (config && config.identifierName) {
      this._identifierName = config.identifierName as keyof T;
    }

    if (initialData) {
      this.putData(initialData);
    }
  }

  async remove(uuids: any | any[]): Promise<void> {
    const storedEntities = await firstValueFrom(this._$innerStore);
    const forRemove = this.convertToArray(uuids);
    for(const rmv of forRemove) {
      storedEntities.delete(uuids);
    }
    this._$innerStore.next(storedEntities);
  }

  async update(entity: T | T[]): Promise<void> {
    const storedEntities = await firstValueFrom(this._$innerStore);
    const updArr = this.convertToArray(entity);
    for (const entity of updArr) {
      storedEntities.set(this.getKeyFromEntity(entity), entity);
    }
  }

  /**
   * set new set into store
   * @param data
   */
  putData(data: T[]): void {

    if (!data) {
      throw new Error('data must be specified, or empty array at least');
    }
    if (!Array.isArray(data)) {
      throw new Error('data must be an array!');
    }

    const newMap: Map<any, T> = new Map<any, T>();
    for (const entity of data) {
        newMap.set(this.getKeyFromEntity(entity), entity)
    }
    this._$innerStore.next(newMap);
  }

  /**
   * test if key exists and return it
   * @param entity
   * @private
   */
  private getKeyFromEntity(entity: T): any {
    const identifier = entity[this._identifierName];
    if (!identifier) {
      throw new Error(`Key ${this._identifierName} not exist on entity `);
    }
    return identifier;
  }

  private convertToArray(entity: T | T[]): T[] {
    let updArr: T[];
    if (!Array.isArray(entity)) {
      updArr = [entity]
    } else {
      updArr = entity;
    }
    return updArr;
  }

  getMap$(): Observable<Map<any, T>> {
    return this._$innerStore.asObservable();
  }

  getAll$(): Observable<T[]> {
    return this.getMap$().pipe(map(eAsMap => Array.from(eAsMap.values())));
  }

  getOne$(uuid: any): Observable<T> {
    return this.getMap$().pipe(map(eAsMap => {
      const found = eAsMap.get(uuid);
      if (!found) {
        throw new Error('Entity with identifier['+ this._identifierName +'] ' + uuid+ 'not found');
      }
      return found;
    }));
  }

}
