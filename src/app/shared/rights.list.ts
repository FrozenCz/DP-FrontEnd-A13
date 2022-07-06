export enum RightsCategoryEnum {
  categories = 'categories',
  assets = 'assets',
  locations = 'locations',
  rights = 'rights',
  units = 'units',
  users = 'users'
}

interface CreateRightsDto {
  relatedTo: RightsCategoryEnum;
  tag: RightsTag;
  name: string;
  description?: string;
}

export enum RightsTag {
  createCategory = 'createCategory',
  deleteCategory = 'deleteCategory',
  updateCategory = 'updateCategory',

  createLocation = 'createLocation',
  deleteLocation = 'deleteLocation',
  updateLocation = 'updateLocation',

  createAssets = 'createAssets',
  removeAssets = 'removeAssets',
  changeAssetsUser = 'changeAssetsUser',
  changeAssetsInformation = 'changeAssetsInformation',

  getUser = 'getUser',
  createUser = 'createUser',
  deleteUser = 'deleteUser',
  updateUsersInformation = 'updateUsersInformation',
  settingRights = 'settingRights',

  setRights = 'setRights',

  createUnits = 'createUnits',
  editUnits = 'editUnits',
  deleteUnits = 'deleteUnits',

  addManagerToUnits = 'addManagerToUnits',
  removeManagerFromUnits = 'removeManagerFromUnits',

}

// je potřeba právo vždy vložit i do DB
export const RightsList: CreateRightsDto[] = [
  {relatedTo: RightsCategoryEnum.categories, tag: RightsTag.createCategory, name: 'Tvorba kategorií majetku'},
  {relatedTo: RightsCategoryEnum.categories, tag: RightsTag.deleteCategory, name: 'Mazání kategorií majetku'},
  {relatedTo: RightsCategoryEnum.categories, tag: RightsTag.updateCategory, name: 'Úprava kategorií majetku'},

  {relatedTo: RightsCategoryEnum.assets, tag: RightsTag.createAssets, name: 'Přidávání majetku'},
  {relatedTo: RightsCategoryEnum.assets, tag: RightsTag.removeAssets, name: 'Vyřazování majetku'},
  {relatedTo: RightsCategoryEnum.assets, tag: RightsTag.changeAssetsUser, name: 'Změna uživatele u majetku'},
  {relatedTo: RightsCategoryEnum.assets, tag: RightsTag.changeAssetsInformation, name: 'Změna informací u majetku'},

  {relatedTo: RightsCategoryEnum.locations, tag: RightsTag.createLocation, name: 'Tvorba lokací'},
  {relatedTo: RightsCategoryEnum.locations, tag: RightsTag.deleteLocation, name: 'Úprava lokací'},
  {relatedTo: RightsCategoryEnum.locations, tag: RightsTag.updateLocation, name: 'Mazání lokací'},

  {relatedTo: RightsCategoryEnum.users, tag: RightsTag.getUser, name: 'zobrazení uživatele'},
  {relatedTo: RightsCategoryEnum.users, tag: RightsTag.createUser, name: 'tvorba uživatele'},
  {relatedTo: RightsCategoryEnum.users, tag: RightsTag.deleteUser, name: 'smazání uživatele'},
  {
    relatedTo: RightsCategoryEnum.users,
    tag: RightsTag.updateUsersInformation,
    name: 'aktualizace uživatelských informací',
    description: 'Aktualizace jména, příjmení a fotografie?'
  },
  {relatedTo: RightsCategoryEnum.users, tag: RightsTag.settingRights, name: 'nastavování práv uživatelů'},

  {relatedTo: RightsCategoryEnum.rights, tag: RightsTag.setRights, name: 'tvorba práv'},

  {relatedTo: RightsCategoryEnum.units, tag: RightsTag.createUnits, name: 'tvorba jednotek'},
  {relatedTo: RightsCategoryEnum.units, tag: RightsTag.editUnits, name: 'úprava jednotek'},
  {relatedTo: RightsCategoryEnum.units, tag: RightsTag.deleteUnits, name: 'mazání jednotek'},
  {relatedTo: RightsCategoryEnum.units, tag: RightsTag.addManagerToUnits, name: 'přidávání manažerů jednotkám'},
  {relatedTo: RightsCategoryEnum.units, tag: RightsTag.removeManagerFromUnits, name: 'odebírání manažerů z jednotek'},
  // { relatedTo: RightsCategoryEnum.users, tag: 'updateUsersInformation', name:'aktualizace uživatelských informací', description: 'Aktualizace jména, příjmení a fotografie?' },
];

