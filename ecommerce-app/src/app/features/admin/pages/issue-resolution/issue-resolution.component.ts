import { Component, OnInit } from '@angular/core';

interface Issue {
  id: number;
  title: string;
  status: 'Open' | 'Resolved' | 'Pending' | 'Closed';
  priority: 'Low' | 'Medium' | 'High';
}

@Component({
  selector: 'app-issue-resolution',
  standalone: false,
  templateUrl: './issue-resolution.component.html',
  styleUrls: ['./issue-resolution.component.scss']
})
export class IssueResolutionComponent implements OnInit {
  issues: Issue[] = [
    { id: 1, title: 'Payment issue', status: 'Open', priority: 'High' },
    { id: 2, title: 'Shipping delay', status: 'Resolved', priority: 'Medium' },
    { id: 3, title: 'Product defect', status: 'Open', priority: 'Low' },
    { id: 4, title: 'Account lockout', status: 'Pending', priority: 'High' }
  ];

  constructor() {}

  ngOnInit(): void {
    // TODO: fetch issues from backend via a service
  }

  resolveIssue(id: number): void {
    const issue = this.issues.find(i => i.id === id);
    if (issue) {
      issue.status = 'Resolved';
      // TODO: call service.updateIssueStatus(id, 'Resolved')
    }
  }

  closeIssue(id: number): void {
    const issue = this.issues.find(i => i.id === id);
    if (issue) {
      issue.status = 'Closed';
      // TODO: call service.updateIssueStatus(id, 'Closed')
    }
  }
}