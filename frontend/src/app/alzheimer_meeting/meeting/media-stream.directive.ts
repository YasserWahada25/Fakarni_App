import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
    selector: 'video[appMediaStream]',
    standalone: true
})
export class MediaStreamDirective implements OnChanges {
    @Input('appMediaStream') stream: MediaStream | null = null;

    constructor(private readonly elementRef: ElementRef<HTMLVideoElement>) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (!('stream' in changes)) return;

        const video = this.elementRef.nativeElement;
        if (video.srcObject !== this.stream) {
            video.srcObject = this.stream;
        }

        if (this.stream) {
            video.play().catch(() => {
                // Browser autoplay policy can block play until user interaction.
            });
        }
    }
}
