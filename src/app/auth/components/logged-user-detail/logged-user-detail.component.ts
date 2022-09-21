import {Component, Input, OnInit} from '@angular/core';
import {JwtToken} from '../../token.service';

@Component({
  selector: 'app-logged-user-detail',
  templateUrl: './logged-user-detail.component.html',
  styleUrls: ['./logged-user-detail.component.scss']
})
export class LoggedUserDetailComponent implements OnInit {
  @Input() jwtToken!: JwtToken;

  constructor() { }

  ngOnInit(): void {
  }

}
