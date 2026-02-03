import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { AssignmentService } from '@core/services/assignment.service';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './private.html'
})
export class Private implements OnInit {
  currentYear = new Date().getFullYear();

  constructor(
    public authService: AuthService,
    public assignmentService: AssignmentService
  ) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.assignmentService.refreshPendingCount();
    }
  }
}
