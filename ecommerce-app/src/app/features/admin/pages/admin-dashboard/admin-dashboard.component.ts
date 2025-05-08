import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  // Placeholder stats; replace with API when backend is ready
  stats = [
    { title: 'Total Users', value: 0, icon: '👥' },
    { title: 'Total Products', value: 0, icon: '📦' },
    { title: 'Total Orders', value: 0, icon: '🛒' },
    { title: 'Open Issues', value: 0, icon: '❗' }
  ];

  newOrders = 0;
  newProducts: Array<{ name: string; price: number }> = [];

  constructor() { }

  ngOnInit(): void {
    // TODO: Inject a dashboard service and fetch real data:
    // this.dashboardService.getStats().subscribe(data => this.stats = data);
    // this.dashboardService.getRecentProducts().subscribe(list => this.newProducts = list);
    // this.dashboardService.getNewOrders().subscribe(count => this.newOrders = count);
  }
}