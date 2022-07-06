import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';

export interface Tutorial {
  icon: string;
  title: string;
  movie: string;
}

@Component({
  selector: 'app-how-to',
  templateUrl: './how-to.component.html',
  styleUrls: ['./how-to.component.scss']
})
export class HowToComponent implements OnInit, OnDestroy {
  tutorials: Tutorial[] = [];
  tutorialsFiltered: Tutorial[] = [];
  unsubscribe: Subject<boolean> = new Subject();
  searchedFor: string = '';

  constructor() {

  }

  ngOnInit(): void {
    this.tutorials = [
      {icon: 'person-outline', title: 'Tvorba uživatele', movie: '/assets/tutorials/tvorbaUzivatele.mp4'},
      {icon: 'person-outline', title: 'Přihlášení / odhlášení', movie: '/assets/tutorials/prihlaseniOdhlaseniUzivatele.mp4'},
      {icon: 'person-outline', title: 'Úprava uživatele', movie: '/assets/tutorials/zmenaUzivatele.mp4'},
      {icon: 'person-outline', title: 'Smazání uživatele', movie: '/assets/tutorials/smazaniUzivatele.mp4'},
      {icon: 'settings-2-outline', title: 'Nastavení práv uživatele', movie: '/assets/tutorials/nastaveniPravUzivatele.mp4'},
      {icon: 'color-palette-outline', title: 'Změna vzhledu', movie: '/assets/tutorials/zmenaVzhledu.mp4'},
      {icon: 'grid-outline', title: 'Tvorba kategorie', movie: '/assets/tutorials/tvorbaKategorie.mp4'},
      {icon: 'grid-outline', title: 'Tvorba podkategorie', movie: '/assets/tutorials/tvorbaPodkategorie.mp4'},
      {icon: 'grid-outline', title: 'Editace kategorie', movie: '/assets/tutorials/editaceKategorie.mp4'},
      {icon: 'grid-outline', title: 'Smazání kategorie', movie: '/assets/tutorials/smazaniKategorie.mp4'},
      {icon: 'grid-outline', title: 'Nastavení úrovní kategorie', movie: '/assets/tutorials/nastaveniSloupcu.mp4'},
      {icon: 'layers-outline', title: 'Tvorba jednotky', movie: '/assets/tutorials/tvorbaJednotky.mp4'},
      {icon: 'layers-outline', title: 'Editace jednotky', movie: '/assets/tutorials/editaceJednotky.mp4'},
      {icon: 'monitor-outline', title: 'Vložení majetku', movie: '/assets/tutorials/vlozeniMajetku.mp4'},
      {icon: 'monitor-outline', title: 'Změna uživatele majetku', movie: '/assets/tutorials/zmenaPrirazeniMajetku.mp4'},
      {icon: 'monitor-outline', title: 'Změna informací majetku', movie: '/assets/tutorials/zmenaMajetku.mp4'},
      {icon: 'monitor-outline', title: 'Vyhledávání majetku', movie: '/assets/tutorials/moznostiHledaniMajetku.mp4'},
      {icon: 'monitor-outline', title: 'Vyřazení majetku', movie: '/assets/tutorials/vyrazeniMajetku.mp4'},
      {icon: 'monitor-outline', title: 'Seznam vyřazeného majetku', movie: '/assets/tutorials/seznamVyrazenehoMajetku.mp4'},
      {icon: 'monitor-outline', title: 'Výběr majetku', movie: '/assets/tutorials/vyberMajetku.mp4'},
      {icon: 'list-outline', title: 'Výběr vs pracovní sestava', movie: '/assets/tutorials/vyberVsPracovniSestava.mp4'},
      {icon: 'list-outline', title: 'Pracovní sestava', movie: '/assets/tutorials/pracovniSestava.mp4'},
      {icon: 'file-text-outline', title: 'Zobrazení protokolu', movie: '/assets/tutorials/tvorbaProtokolu.mp4'},
      {icon: 'file-text-outline', title: 'Karta majetku osoby', movie: '/assets/tutorials/tvorbaKartyUzivatele.mp4'},
      {icon: 'bar-chart-outline', title: 'Tvorba pohledů', movie: '/assets/tutorials/tvorbaPohledu.mp4'},
      {icon: 'bar-chart-outline', title: 'Tvorba pohledů 2', movie: '/assets/tutorials/tvorbaPohledu2.mp4'},

    ];
    this.tutorialsFiltered = this.tutorials;
  }


  ngOnDestroy(): void {
    this.unsubscribe.next(true);
  }


}
