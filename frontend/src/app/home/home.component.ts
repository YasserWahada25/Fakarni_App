import { Component, OnInit, ElementRef, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.8s ease-in', style({ opacity: 1 }))
      ])
    ]),
    trigger('staggerList', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger('150ms', [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class HomeComponent implements OnInit {
  heroVisible = signal(false);
  servicesVisible = signal(false);
  ctaVisible = signal(false);

  private platformId = inject(PLATFORM_ID);

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    // Trigger hero animation immediately
    setTimeout(() => this.heroVisible.set(true), 100);

    // Only run IntersectionObserver in browser environment
    if (isPlatformBrowser(this.platformId)) {
      // Setup Intersection Observer for scroll animations
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              if (entry.target.classList.contains('services-section')) {
                this.servicesVisible.set(true);
              } else if (entry.target.classList.contains('cta-section')) {
                this.ctaVisible.set(true);
              }
            }
          });
        },
        { threshold: 0.2 }
      );

      // Observe sections
      setTimeout(() => {
        const sections = this.elementRef.nativeElement.querySelectorAll('.services-section, .cta-section');
        sections.forEach((section: Element) => observer.observe(section));
      }, 0);
    }
  }
}

