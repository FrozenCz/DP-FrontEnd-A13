import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, ReplaySubject, throwError} from 'rxjs';
import {ICategory, ICategoryGet, ICategoryGetObject, IColumnName} from './models/category.model';
import {HttpClient} from '@angular/common/http';
import {TokenService} from '../auth/token.service';
import {catchError, map, take, tap} from 'rxjs/operators';
import {ColDef} from 'ag-grid-community';
import {Unit} from '../units/models/unit.model';

export enum CategorySettingsEnum {
  categoryColumnNames = 'categoryColumnNames'
}

export interface IColumnSettings {
  name: CategorySettingsEnum;
  config: string;
}


interface ColDefExt {
  colDef: ColDef;
  categoryDeep: number;
  code: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private categories$: BehaviorSubject<ICategory[]> = new BehaviorSubject<ICategory[]>([]);

  //todo: podivej se poradne co to dela
  private categoriesSettingsStore: BehaviorSubject<IColumnSettings> = new BehaviorSubject<IColumnSettings>({config: '', name: CategorySettingsEnum.categoryColumnNames});
  private catSettings$: Observable<IColumnSettings> = this.categoriesSettingsStore.asObservable();

  private categoriesColDefsStore: BehaviorSubject<ColDefExt[]> = new BehaviorSubject<ColDefExt[]>([]);
  private categoriesColDefs$ = this.categoriesColDefsStore.asObservable();

  constructor(
    private httpClient: HttpClient,
    private tokenService: TokenService
  ) {

    this.getColumnSettings(CategorySettingsEnum.categoryColumnNames).pipe(take(1)).subscribe((columnSettings) => {
      const newColDefs: ColDefExt[] = [];
      if (!columnSettings) {
        columnSettings = {name: CategorySettingsEnum.categoryColumnNames, config: '[]'};
      }

      const catTree = JSON.parse(columnSettings.config);

      let i = 0;
      let colDeep = 0;
      catTree?.forEach((category: any) => {
        newColDefs.push({colDef: {headerName: category.name}, categoryDeep: colDeep, code: false});
        i++;
        if (category.useCodeAsColumn) {
          newColDefs.push({colDef: {headerName: category.codeName}, categoryDeep: colDeep, code: true});
          i++;
        }
        colDeep++;
      });

      this.categoriesSettingsStore.next(columnSettings);
      this.categoriesColDefsStore.next(newColDefs);
    });

    this.tokenService.getToken().subscribe(() => {
      this.init();
    });

  }

  getCategoryById(id: number): ICategory | undefined {
    return this.categories$.getValue().find(category => category.id === id);
  }


  private init(): void {
    this.httpClient.get<ICategoryGetObject[]>('/rest/categories').pipe(
      map((rawCategories) => {
        let categories: ICategory[] = [];

        if (Array.isArray(rawCategories)) {
          categories = this.deepSearch(rawCategories);
        } else {
          categories = this.deepSearch([rawCategories]);
        }
        return categories;
      })
    ).subscribe((categories) => {
      this.categories$.next(categories);
    });
  }

  deepSearch(iCategoryGets: ICategoryGetObject[]): ICategory[] {
    const queue: any = [...iCategoryGets];
    const result: any[] = [];
    let tree: any[] = [];
    let treeIds = [];
    let columnValues: IColumnName[] = [];
    let lastParent = null;

    while (queue.length > 0) {
      const category = queue.shift();
      if (category.children?.length > 0) {
        category.children.reverse();
        category.children.forEach((child: any) => {
          child.parent = category.id;
          child.parentName = category.name;
          child.parentColumnValues = {
            name: category.name,
            codeName: category.code,
            useCodeAsColumn: this.isCodeAsColumnOnThisDepth(tree.length)
          };
          queue.unshift(child);
        });
      }
      if (category.parent !== lastParent || category.parent === undefined) {
        lastParent = category.parent;
        if (category.parent) {
          const unitIndex = treeIds.indexOf(category.parent);
          if (unitIndex !== -1) {
            columnValues.splice(-(tree.length - unitIndex - 1));
            tree.splice(-(tree.length - unitIndex - 1));
            treeIds.splice(-(treeIds.length - unitIndex - 1));
          } else {
            columnValues.push(category.parentColumnValues);
            tree.push(category.parentName);
            treeIds.push(category.parent);
          }
        } else {
          columnValues = [];
          tree = [];
          treeIds = [];
        }
      }
      result.push({
        id: category.id,
        name: category.name,
        code: category.code,
        parent: result.find(u => u.name === tree[tree.length - 1])?.id,
        children: [...category.children.map((u:any) => u.id)],
        tree: [...tree, category.name],
        treeIds: [...treeIds, category.id],
        columnValues: [...columnValues, {
          name: category.name,
          codeName: category.code,
          useCodeAsColumn: this.isCodeAsColumnOnThisDepth(tree.length)
        }]
      });
    }
    return result.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  }

  public createCategory(name: string, code: string, parent: number | null): Observable<ICategoryGet> {
    return this.httpClient.post<ICategoryGet>('/rest/categories', {name, code, parent});
  }

  public getCategories(): Observable<ICategory[]> {
    return this.categories$.asObservable();
  }

  public saveColumnSettings(columnSettings: IColumnSettings): Observable<void> {
    return this.httpClient.put<void>('/rest/categories/settings', {...columnSettings})
      .pipe(
        catchError(err => {
          return throwError(err);
        }),
        tap(() => {
          this.categoriesSettingsStore.next(columnSettings);
        })
      );
  }

  public getColumnSettings(categorySettingsEnum: CategorySettingsEnum): Observable<IColumnSettings> {
    return this.httpClient.get<IColumnSettings>('/rest/categories/settings/' + categorySettingsEnum);
  }

  public getCatSettings(): Observable<IColumnSettings> {
    return this.catSettings$;
  }

  public getCategoryColumnNames(): Observable<IColumnName[]> {
    return this.catSettings$.pipe(
      map((settings) => {
        if (!settings?.config) {
          return;
        }
        return JSON.parse(settings?.config);
      }),
    );
  }

  public getColumnValuesInArray(columnValues: IColumnName[] | undefined): string[] | undefined {
    if (!columnValues || columnValues.length < 1) {
      return;
    }
    const columnArray = [];
    for (const columnName of columnValues) {
      columnArray.push(columnName.name);
      if (columnName.useCodeAsColumn) {
        columnArray.push(columnName.codeName);
      }
    }
    return columnArray;
  }

  private isCodeAsColumnOnThisDepth(depth: number): boolean {
    if (!this.categoriesSettingsStore) {
      return false;
    }
    const columnConfig = JSON.parse(this.categoriesSettingsStore.getValue().config);
    if (columnConfig && depth + 1 > columnConfig.length) {
      return false;
    }
    return columnConfig[depth].useCodeAsColumn;
  }

  getDescendants(categoryId: number): Observable<Unit[]> {
    return this.httpClient.get<ICategory[]>('rest/categories/' + categoryId + '/descendants');
  }

  isAbleToDelete(deletedCategoryId: number): Observable<boolean> {
    return this.httpClient.get<boolean>('rest/categories/' + deletedCategoryId + '/isAbleToDelete');
  }

  /**
   * delete category
   * @param deletedCategoryId Id of category to be deleted
   */
  deleteCategory(deletedCategoryId: number): any {
    return this.httpClient.delete<void>('rest/categories/' + deletedCategoryId);
  }

  updateCategory(name: string, code: string, categoryId: number): Observable<ICategoryGet> {
    return this.httpClient.patch<ICategoryGet>('rest/categories/' + categoryId, {name, code});
  }

  wsCategoryUpdate(changes: ICategoryGet): void {
    const responseCategory = changes;
    const updatedCategories = [...this.categories$.getValue()];
    const categoryIndexFound = updatedCategories.findIndex(category => category.id === responseCategory.id);

    if (categoryIndexFound === -1) {
      const nCategory: ICategory = {
        ...responseCategory,
        tree: [],
        treeIds: [],
        parent: responseCategory.parent?.id,
        parentName: responseCategory.parent?.name,
        children: [],
        columnValues: []
      };

      let ancestorPath: any[] = [];
      let ancestorTreeIds: any[] = [];
      let ancestorColumnValues: any[] = [];
      if (responseCategory.parent) {
        const parentCategory = updatedCategories.find(category => category.id === responseCategory.parent.id);
        if (parentCategory) {
          ancestorPath = parentCategory.tree;
          ancestorTreeIds = parentCategory.treeIds;
          ancestorColumnValues = parentCategory.columnValues;
        }
      }
      nCategory.tree = [...ancestorPath, nCategory.name];
      nCategory.treeIds = [...ancestorTreeIds, nCategory.id];
      nCategory.columnValues = [
        ...ancestorColumnValues,
        {
          name: nCategory.name,
          codeName: nCategory.code,
          useCodeAsColumn: this.isCodeAsColumnOnThisDepth(nCategory.tree.length)
        }];
      updatedCategories.push(nCategory);
      this.categories$.next(updatedCategories);
    } else {
      this.init();
    }
  }

  wsCategoryDelete(deletedCategoryId: number): void {
    const updatedCategories = this.categories$.getValue().filter(category => !category.treeIds.includes(deletedCategoryId));
    this.categories$.next(updatedCategories);
  }

  getCategoryTreeForDetail(id: number): string | undefined {
    const category = this.getCategoryById(id);
    return category?.tree?.join(' > ');
  }
}
