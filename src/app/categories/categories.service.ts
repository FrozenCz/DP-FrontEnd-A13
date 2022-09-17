import {Injectable} from '@angular/core';
import {BehaviorSubject, noop, Observable, switchMap, throwError} from 'rxjs';
import {Category, ICategoryGet, CategoryGetDTO, IColumnName} from './models/category.model';
import {HttpClient} from '@angular/common/http';
import {TokenService} from '../auth/token.service';
import {catchError, map, take, tap} from 'rxjs/operators';
import {ColDef} from 'ag-grid-community';
import {Store} from '../store/store';

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
  categoriesStore$: Store<Category> = new Store<Category>({identifierName: 'id'});

  //todo: config na sloupce.... super vyreseno... facku bych si dal
  private categoriesSettingsStore: BehaviorSubject<IColumnSettings> = new BehaviorSubject<IColumnSettings>({
    config: '',
    name: CategorySettingsEnum.categoryColumnNames
  });
  private catSettings$: Observable<IColumnSettings> = this.categoriesSettingsStore.asObservable();

  private categoriesColDefsStore: BehaviorSubject<ColDefExt[]> = new BehaviorSubject<ColDefExt[]>([]);

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

    this.tokenService.getToken()
      .pipe(switchMap(() => {
        return this.fetchCategories()
      }))
      .subscribe((categories) => {
        this.categoriesStore$.putData(categories);
      });

  }

  public static getCategoryTreeForDetail(category: Category): string {
    return category.tree?.join(' > ');
  }

  getCategoryById(id: number): Observable<Category> {
    return this.categoriesStore$.getOne$(id);
  }


  private fetchCategories(): Observable<Category[]> {
    return this.httpClient.get<CategoryGetDTO[]>('/rest/categories').pipe(
      map((rawCategories) => {
        let categories: Category[] = [];

        if (Array.isArray(rawCategories)) {
          categories = this.deepSearchAndConvertDTOtoCategory(rawCategories);
        } else {
          categories = this.deepSearchAndConvertDTOtoCategory([rawCategories]);
        }
        return categories;
      })
    )
  }

  deepSearchAndConvertDTOtoCategory(iCategoryGets: CategoryGetDTO[]): Category[] {
    const queue: any = [...iCategoryGets];
    const result: Category[] = [];
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
      const newCategory = new Category(category.id, category.name);
      newCategory.code = category.code;
      newCategory.parent = result.find(u => u.name === tree[tree.length - 1])?.id;
      newCategory.children = [...category.children.map((u: any) => u.id)]
      newCategory.tree = [...tree, category.name];
      newCategory.treeIds = [...treeIds, category.id];
      newCategory.columnValues = [...columnValues, {
        name: category.name,
        codeName: category.code,
        useCodeAsColumn: this.isCodeAsColumnOnThisDepth(tree.length)
      }]
      result.push(newCategory);
    }

    return result.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  }

  public createCategory(name: string, code: string, parent: number | null): Observable<ICategoryGet> {
    return this.httpClient.post<ICategoryGet>('/rest/categories', {name, code, parent});
  }

  public getCategories(): Observable<Category[]> {
    return this.categoriesStore$.getAll$();
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
    const configVal = this.categoriesSettingsStore.getValue().config;
    if (!configVal) {
      return false;
    }
    const columnConfig = JSON.parse(configVal);
    if (columnConfig && depth + 1 > columnConfig.length) {
      return false;
    }
    return columnConfig[depth].useCodeAsColumn;
  }

  getDescendants(categoryId: number): Observable<Category[]> {
    return this.httpClient.get<Category[]>('rest/categories/' + categoryId + '/descendants');
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
    this.fetchCategories();
  }

  wsCategoryDelete(deletedCategoryId: number): void {
    this.categoriesStore$.remove(deletedCategoryId).then(noop)
      .catch(err => {
        alert(err);
      });
  }


}
