import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinViewComponent } from './coin-view.component';

describe('CoinViewComponent', () => {
  let component: CoinViewComponent;
  let fixture: ComponentFixture<CoinViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoinViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoinViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
