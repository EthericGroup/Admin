import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  @Output() openMenu: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  toogleMenu(){
    this.openMenu.emit();
  }

}
