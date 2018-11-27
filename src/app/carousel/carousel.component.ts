import {
  AfterViewInit,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  Input,
  OnInit,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { CarouselItemDirective } from '../carousel-item.directive';
import { animate, AnimationBuilder, AnimationFactory, AnimationPlayer, style } from '@angular/animations';

@Directive({
  selector: '.appCarouselItemElement'
})
export class CarouselItemElementDirective {
}

const EASEIN = '250ms ease-in';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements AfterViewInit {
  @ContentChildren(CarouselItemDirective) items: QueryList<CarouselItemDirective>;
  @ViewChildren(CarouselItemElementDirective, { read: ElementRef }) private itemsElements: QueryList<ElementRef>;
  @ViewChild('carousel') private carousel: ElementRef;
  @Input() timing = EASEIN;
  @Input() showControls = true;
  @Input() showArrowsNavigation = true;
  @Input() showStepsNavigation = true;
  private player: AnimationPlayer;
  private itemWidth: number;
  private currentSlide = 0;
  carouselWrapperStyle = {};

  constructor( private builder: AnimationBuilder ) {}

  ngAfterViewInit() {
    setTimeout(() => this.setWidth());
  }

  setWidth() {
    this.itemWidth = this.itemsElements.first.nativeElement.getBoundingClientRect().width;
    this.carouselWrapperStyle = {
      width: `${this.itemWidth}px`
    };
  }

  next() {
    this.setCurrentStep(this.calculateNextStep());
    this.animateStepChange();
  }

  private calculateNextStep(): number {
    return (this.currentSlide + 1) % this.items.length;
  }

  prev() {
    this.setCurrentStep(this.calculatePreviousStep());
    this.animateStepChange();
  }

  private calculatePreviousStep(): number {
    return ((this.currentSlide - 1) + this.items.length) % this.items.length;
  }

  changeStep(index: number) {
    this.setCurrentStep(index);
    this.animateStepChange();
  }

  private setCurrentStep(index: number) {
    this.currentSlide = index;
  }

  private animateStepChange() {
    const offset = this.currentSlide * this.itemWidth;

    const myAnimation: AnimationFactory = this.buildAnimation(offset);
    this.player = myAnimation.create(this.carousel.nativeElement);
    this.player.play();
  }

  private buildAnimation(offset: number): AnimationFactory {
    return this.builder.build([
      animate(this.timing, style({ transform: `translateX(-${offset}px)` }))
    ]);
  }

  isCurrentSlide(index: number): boolean {
    return index === this.currentSlide;
  }

  isFirstSlideActive(): boolean {
    return this.currentSlide === 0;
  }

  isLastSlideActive(): boolean {
    return this.currentSlide === this.items.length - 1;
  }
}

