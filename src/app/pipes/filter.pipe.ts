import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(value: any[], filterParts: string[] | undefined, propName: string): any {
    if (value.length === 0 || !filterParts || filterParts.length === 0 ) {
      return value;
    }
    const resultArray = [];
    for (const item of value) {
      if (this.searchFor(item[propName], filterParts)) {
        resultArray.push(item);
      }
    }
    return resultArray;
  }


  private searchFor(searchedIn: string, filterParts: string[]): boolean {
    if (searchedIn) {
      let founded = 0;
      const filteredParts = filterParts.filter(p => p !== '');
      if (filteredParts) {
        for (const mask of filteredParts) {
          const regex = new RegExp(this.convert(mask), 'ig');
          const oldValPos = this.convert(searchedIn).search(regex);
          if (oldValPos > -1) {
            founded++;
          }
        }
      }
      return founded === filteredParts.length;
    }
    return false;
  }

  private convert(str: string): string {
    const map = {
      '-': ' ',
      a: 'á|à|ã|â|ä|À|Á|Ã|Â|Ä',
      c: 'ç|Ç|č|Č',
      d: 'ď|Ď',
      e: 'é|è|ê|ë|ě|É|È|Ê|Ë|Ě',
      i: 'í|ì|î|ï|Í|Ì|Î|Ï',
      n: 'ň|Ň|ñ|Ñ',
      o: 'ó|ò|ô|õ|ö|Ó|Ò|Ô|Õ|Ö',
      r: 'ř|Ř',
      s: 'š|Š',
      t: 'ť|Ť',
      u: 'ú|ù|û|ů|ü|Ú|Ù|Û|Ü',
      y: 'ý|Ý',
      z: 'ž|Ž'
    };
    for (const pattern in map) {
      const keyAs = pattern as keyof typeof map;
      str = str.replace(new RegExp(map[keyAs], 'g'), pattern);
    }
    return str;
  }

}
