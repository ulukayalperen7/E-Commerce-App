import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-management',
  standalone: false,
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users = [
    { id: 1, name: 'Ahmet Yılmaz', email: 'ahmet@example.com', role: 'Customer' },
    { id: 2, name: 'Ayşe Demir', email: 'ayse@example.com', role: 'Customer' },
    { id: 3, name: 'Mehmet Kaya', email: 'mehmet@example.com', role: 'Admin' }
  ];

  constructor() {}

  ngOnInit(): void {}

  deleteUser(id: number): void {
    this.users = this.users.filter(user => user.id !== id);
  }

  promoteToAdmin(id: number): void {
    const user = this.users.find(user => user.id === id);
    if (user) user.role = 'Admin';
  }
}
