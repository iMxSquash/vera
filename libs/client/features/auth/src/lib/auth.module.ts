import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { AuthService } from './services/auth.service';

@NgModule({
  imports: [CommonModule, LoginComponent],
  providers: [AuthService],
  exports: [LoginComponent],
})
export class AuthModule {}
