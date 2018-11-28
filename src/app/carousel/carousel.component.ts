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
interface PositionDifferences {
  x: number;
  y: number;
}

enum Swipe_Type {
  Left,
  Right,
  Up,
  Down
}

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
  private initialX: number;
  private initialY: number;
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

  startTouchEvent(event) {
    const { clientX, clientY } = event.touches[0];
    this.setInitialPosition(clientX, clientY);
  }

  private setInitialPosition(x: number, y: number) {
    this.initialX = x;
    this.initialY = y;
  }

  onTouchMove(event) {
    event.preventDefault();
    try {
      this.throwIfInitalPositionsNotPresent();

      const { clientX, clientY } = event.touches[0];
      const differences = this.getDifferences(clientX, clientY);
      const swipeDirection = this.getSwipeDirection(differences);
      this.proccessSwipe(swipeDirection);
    } catch (error) {
      // Just do nothing if initial positions arent set
    }

    this.setInitialPosition(null, null);
  }

  private throwIfInitalPositionsNotPresent(): any {
    if (this.initialX == null || this.initialY == null) {
       throw new Error('Postion inital values not provided');
    }
  }

  private getDifferences(x, y): PositionDifferences {
    return {
      x: this.initialX - x,
      y: this.initialY - y
    };
  }

  private getSwipeDirection(movePositions: PositionDifferences): Swipe_Type {
    if (this.isHorizontalMove(movePositions)) {
      return movePositions.x > 0 ? Swipe_Type.Left : Swipe_Type.Right;
    } else {
      return movePositions.x > 0 ? Swipe_Type.Up : Swipe_Type.Down;
    }
  }

  private isHorizontalMove(movePositions: PositionDifferences): boolean {
    return Math.abs(movePositions.x) > Math.abs(movePositions.y);
  }

  private proccessSwipe(direction: Swipe_Type) {
    switch (direction) {
      case Swipe_Type.Left:
        this.next();
        break;
      case Swipe_Type.Right:
        this.prev();
        break;
      default:
        // Fell trhought
    }
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

