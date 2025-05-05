import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  stats = [
    { title: 'Total Users', value: 1560, icon: '👥' },
    { title: 'Products', value: 320, icon: '📦' },
    { title: 'Orders Today', value: 87, icon: '🛒' },
    { title: 'Open Issues', value: 5, icon: '❗' }
  ];

  newOrders = 5;
  newProducts = [
    { name: 'Product 1', price: 20 },
    { name: 'Product 2', price: 35 },
    { name: 'Product 3', price: 15 }
  ];

  constructor() {}

  ngOnInit(): void {}
}
