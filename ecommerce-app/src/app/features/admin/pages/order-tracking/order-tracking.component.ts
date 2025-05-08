import { Component, OnInit } from '@angular/core';

interface Order {
  id: string;
  customer: string;
  date: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered';
}

@Component({
  selector: 'app-order-tracking',
  standalone: false,
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.scss']
})
export class OrderTrackingComponent implements OnInit {
  orders: Order[] = [];

  constructor() {}

  ngOnInit(): void {
    // TODO: replace with service call
    this.orders = [
      { id: 'ORD123', customer: 'John Doe', date: '2025-05-01', status: 'Shipped' },
      { id: 'ORD124', customer: 'Jane Smith', date: '2025-05-02', status: 'Processing' },
      { id: 'ORD125', customer: 'Bob Johnson', date: '2025-05-03', status: 'Delivered' },
      { id: 'ORD126', customer: 'Alice Brown', date: '2025-05-04', status: 'Pending' }
    ];
  }
}