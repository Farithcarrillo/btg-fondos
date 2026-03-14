import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@shared/components/header/header';
import { FooterComponent } from '@shared/components/footer/footer';
import { AlertComponent } from '@shared/components/alert/alert';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, AlertComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent { }