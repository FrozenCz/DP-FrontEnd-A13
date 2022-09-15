import {Component, OnInit} from '@angular/core';
import {NbThemeService} from '@nebular/theme';

interface Theme {
  theme: string;
  title: string;
  color: string;
  background: string;
  contrastMode: boolean;
}

@Component({
  selector: 'app-theme-selector',
  templateUrl: './theme-selector.component.html',
  styleUrls: ['./theme-selector.component.scss']
})
export class ThemeSelectorComponent implements OnInit {
  paletteSelectorOpen = false;
  themes: Theme[] = [
    {theme: 'default', title: 'default', color: '#3366ff', background: '#f7f9fc', contrastMode: false},
    {theme: 'dark', title: 'dark', color: '#3366ff', background: '#192038', contrastMode: false},
    {theme: 'cosmic', title: 'cosmic', color: '#a16eff', background: '#252547', contrastMode: false},
    {theme: 'dark-bp', title: 'idea', color: '#0095D5', background: '#36383b', contrastMode: false},
    {theme: 'dark-cold', title: 'idea', color: '#1e2121', background: '#1f3944', contrastMode: false},
    {theme: 'light-bp', title: 'light', color: '#0095D5', background: '#e0e3e5', contrastMode: false},
    {theme: 'mat-bp', title: 'mat', color: '#0f4021', background: '#b3b4ba', contrastMode: true},
    {theme: 'navy', title: 'navy', color: '#FFB733', background: '#264437', contrastMode: false},
  ];
  selectedTheme: Theme = this.themes[0];




  constructor(private nbThemeService: NbThemeService) {
  }

  ngOnInit(): void {
    this.getThemeFromLocalStorage();
  }

  getThemeFromLocalStorage(): void {
    const theme = localStorage.getItem('bpKnop');
    if (theme) {
      this.selectTheme(JSON.parse(theme));
    }
  }

  saveThemeToLocalStorage(theme: Theme): void {
    localStorage.setItem('bpKnop', JSON.stringify(theme));
  }

  selectTheme(theme: Theme): void {
    this.selectedTheme = theme;
    this.saveThemeToLocalStorage(theme);
    this.nbThemeService.changeTheme(theme.theme);
    if (theme.contrastMode) {
      this.nbThemeService.appendLayoutClass('contrastMode');
    } else {
      this.nbThemeService.removeLayoutClass('contrastMode');
    }
  }

}
