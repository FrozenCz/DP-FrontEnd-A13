export abstract class Utils {

  private constructor() {
  }

  public static async toBase64(file: File | Blob): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  public static createMap<U, T>(params: { array: T[], propertyName?: string }): Map<U, T> {
    const {array, propertyName = 'uuid'} = params;
    const map: Map<U, T> = new Map();
    const key = propertyName as keyof T;
    // @ts-ignore
    array.forEach(a => map.set(a[key], a))
    return map;
  }

}
