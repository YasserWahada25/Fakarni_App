import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { FooterComponent } from './footer.component';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [RouterOutlet, NavbarComponent, FooterComponent],
    templateUrl: './main-layout.component.html',
    styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent { }
