import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-customer-profile',
  standalone: false,
  templateUrl: './customer-profile.component.html',
  styleUrls: ['./customer-profile.component.scss']
})
export class CustomerProfileComponent implements OnInit {
  user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    joinedDate: new Date('2022-01-01')
  };

  constructor() { }

  ngOnInit(): void {}
}
