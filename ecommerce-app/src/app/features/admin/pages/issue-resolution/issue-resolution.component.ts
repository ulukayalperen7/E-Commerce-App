import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-issue-resolution',
  standalone: false,
  templateUrl: './issue-resolution.component.html',
  styleUrls: ['./issue-resolution.component.scss']
})
export class IssueResolutionComponent implements OnInit {
  issues = [
    { id: 1, title: 'Payment issue', status: 'Open', priority: 'High' },
    { id: 2, title: 'Shipping delay', status: 'Resolved', priority: 'Medium' },
    { id: 3, title: 'Product defect', status: 'Open', priority: 'Low' },
    { id: 4, title: 'Account lockout', status: 'Pending', priority: 'High' }
  ];

  constructor() {}

  ngOnInit(): void {}

  resolveIssue(id: number): void {
    const issue = this.issues.find(issue => issue.id === id);
    if (issue) {
      issue.status = 'Resolved';
    }
  }

  closeIssue(id: number): void {
    const issue = this.issues.find(issue => issue.id === id);
    if (issue) {
      issue.status = 'Closed';
    }
  }
}
