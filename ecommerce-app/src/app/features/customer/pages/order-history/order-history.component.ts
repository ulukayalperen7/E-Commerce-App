import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-order-history',
  standalone: false,
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})
export class OrderHistoryComponent implements OnInit {

  orders = [
    {
      id: 'ORD12345',
      date: new Date('2024-10-01'),
      status: 'Delivered',
      total: 399.99,
      items: [
        { name: 'Wireless Headphones', quantity: 1, price: 199.99 },
        { name: 'Bluetooth Speaker', quantity: 1, price: 200.00 }
      ]
    },
    {
      id: 'ORD12346',
      date: new Date('2024-11-15'),
      status: 'Shipped',
      total: 149.50,
      items: [
        { name: 'USB-C Cable', quantity: 3, price: 49.83 }
      ]
    }
  ];

  constructor() {}

  ngOnInit(): void {}
}
