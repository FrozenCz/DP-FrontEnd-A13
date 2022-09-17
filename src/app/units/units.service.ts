import {Injectable} from '@angular/core';
import {NbDialogService} from '@nebular/theme';
import {IUnitGet, Unit, UnitsGetObject, UnitUpdate} from './models/unit.model';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, forkJoin, Observable, throwError} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import {TokenService} from '../auth/token.service';


@Injectable({
  providedIn: 'root'
})
export class UnitsService {
  private units$: BehaviorSubject<Unit[]> = new BehaviorSubject<Unit[]>([]);
  private allUnits$: BehaviorSubject<Unit[]> = new BehaviorSubject<Unit[]>([]);


  constructor(private nbDialogService: NbDialogService, private httpClient: HttpClient, private tokenService: TokenService) {
    this.tokenService.getToken().subscribe((token) => {
      if (token) {
        this.loadUnits();
      } else {
        this.units$.next([]);
        this.allUnits$.next([]);
      }
    });
  }

  getUnits(): Observable<Unit[]> {
    return this.units$.asObservable();
  }

  createUnit(name: string, parent: number): Observable<IUnitGet> {
    return this.httpClient.post<IUnitGet>('/rest/units', {name, parent}).pipe(
      tap((newUnit) => {
        const nUnit: Unit = {...newUnit, parent: newUnit.parent?.id, tree: [], children: []};
        const updatedUnits = [...this.units$.getValue()];
        let ancestorPath: string[] = [];
        if (newUnit.parent) {
          const ancestors = updatedUnits.find(units => units.id === newUnit.parent.id)?.tree;
          if (ancestors && ancestors.length > 0) {
            ancestorPath = ancestors;
          }
        }
        nUnit.tree = [...ancestorPath, nUnit.name];
        updatedUnits.push(nUnit);
        this.units$.next(updatedUnits);
      })
    );
  }

  init(): Observable<[Unit[], Unit[]]> {
    return forkJoin([this.httpClient.get<UnitsGetObject[] | UnitsGetObject>('/rest/units'),
      this.httpClient.get<UnitsGetObject[] | UnitsGetObject>('/rest/units/getAllUnits')])
      .pipe(map(([source, source2]) => {
        let units: Unit[] = [];
        let allUnits: Unit[] = [];

        if (Array.isArray(source)) {
          units = this.deepSearch(source);
        } else {
          units = this.deepSearch([source]);
        }

        if (Array.isArray(source2)) {
          allUnits = this.deepSearch(source2);
        } else {
          allUnits = this.deepSearch([source2]);
        }
        return [units, allUnits];
      }));
  }

  /**
   * prohledávání do hloubky
   */
  deepSearch(unitsGetObject: UnitsGetObject[]): Unit[] {
    const queue: any = [...unitsGetObject];
    const result: any[] = [];
    let tree: string[] = [];
    let lastParent = null;

    while (queue.length > 0) {
      const unit = queue.shift();
      if (unit.children?.length > 0) {
        unit.children.reverse();
        unit.children.forEach((child: any) => {
          child.parent = unit.name;
          queue.unshift(child);
        });
      }
      if (unit.parent !== lastParent || unit.parent === undefined) {
        lastParent = unit.parent;
        if (unit.parent) {
          const unitIndex = tree.indexOf(unit.parent);
          if (unitIndex !== -1) {
            tree.splice(-(tree.length - unitIndex - 1));
          } else {
            tree.push(unit.parent);
          }
        } else {
          tree = [];
        }
      }
      result.push({
        id: unit.id,
        name: unit.name,
        parent: result.find(u => u.name === tree[tree.length - 1])?.id,
        children: [...unit.children.map((u: any) => u.id)],
        tree: [...tree, unit.name]
      });
    }
    return result.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  }

  loadUnits(): void {
    this.init().pipe(catchError(err => {
      alert(err);
      return throwError(err);
    })).subscribe(([units, allUnits]) => {
      this.units$.next(units);
      this.allUnits$.next(allUnits);
    });
  }


  updateUnit(unitId: number, value: any): Observable<UnitUpdate> {
    return this.httpClient.put<UnitUpdate>('/rest/units/' + unitId, {name: value})
      .pipe(
        tap((updatedUnit) => {
          const updatedUnits: Unit[] = [...this.units$.getValue()];
          const index = updatedUnits.findIndex(unit => unit.id === updatedUnit.id);
          const updatedName = updatedUnits[index].name;

          updatedUnits[index].tree.splice(-1, 1);
          updatedUnits[index] = {
            ...updatedUnits[index],
            ...updatedUnit,
            tree: [...updatedUnits[index].tree, updatedUnit.name]
          };

          if (updatedUnits[index].children.length) {
            const childrenIds: number[] = [...updatedUnits[index].children.reverse()];
            while (childrenIds.length) {
              const childId = childrenIds.shift();
              const childIndex = updatedUnits.findIndex(unit => unit.id === childId);
              const updateTreeIndex = updatedUnits[childIndex].tree.indexOf(updatedName);
              updatedUnits[childIndex].tree[updateTreeIndex] = updatedUnit.name;
              if (updatedUnits[childIndex].children.length) {
                childrenIds.unshift(...updatedUnits[childIndex].children.reverse());
              }
            }
          }
          this.units$.next(updatedUnits);
        })
      );
  }

  deleteUnit(unitId: number): Observable<void> {
    return this.httpClient.delete<void>('rest/units/' + unitId).pipe(tap(() => {
      this.loadUnits();
    }));
  }

  getDescendants(unitId: number): Observable<Unit[]> {
    return this.httpClient.get<Unit[]>('rest/units/' + unitId + '/descendants');
  }

  getAllUnits(): Observable<Unit[]> {
    return this.allUnits$.asObservable();
  }

  ableToDelete(unitId: number): Observable<boolean> {
    return this.httpClient.get<boolean>('rest/units/' + unitId + '/ableToDelete');
  }
}
