import {Component} from '@angular/core';
import {CategoriesService} from './categories.service';


@Component({
  selector: 'app-categories-component',
  templateUrl: './categories.component.html',
  styles: [':host{height: 100%;width: 100%;overflow: auto}']
})
export class CategoriesComponent {

  constructor(private categoriesService: CategoriesService) {
  }
}
