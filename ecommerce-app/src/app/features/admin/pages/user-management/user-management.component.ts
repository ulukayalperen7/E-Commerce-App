import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Customer' | 'Admin';
}

@Component({
  selector: 'app-user-management',
  standalone: false,
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // TODO: fetch users from backend via service
    this.users = [
      { id: 1, name: 'Ahmet Yılmaz', email: 'ahmet@example.com', role: 'Customer' },
      { id: 2, name: 'Ayşe Demir', email: 'ayse@example.com', role: 'Customer' },
      { id: 3, name: 'Mehmet Kaya', email: 'mehmet@example.com', role: 'Admin' }
    ];
  }

  deleteUser(id: number): void {
    // TODO: call service to delete, then refresh list
    this.users = this.users.filter(u => u.id !== id);
  }

  promoteToAdmin(id: number): void {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.role = 'Admin';
      // TODO: call service to update role
    }
  }

  addUser(): void {
    // navigate to add-user form (to be implemented)
    this.router.navigate(['/admin/user-management/add']);
  }
}