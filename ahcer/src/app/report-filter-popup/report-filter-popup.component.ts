import {
  AfterViewInit,
  Component,
  ElementRef, EventEmitter, HostListener,
  Input, OnChanges,
  OnInit, Output, SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {ConnectedPosition, Overlay, OverlayContainer, OverlayRef} from "@angular/cdk/overlay";
import {TemplatePortal} from "@angular/cdk/portal";
import {
  animate,
  AnimationBuilder,
  AnimationMetadata,
  AnimationPlayer,
  style
} from "@angular/animations";

@Component({
  selector: 'app-report-filter-popup',
  templateUrl: './report-filter-popup.component.html',
  styleUrls: ['./report-filter-popup.component.scss']
})
export class ReportFilterPopupComponent implements OnInit, AfterViewInit, OnChanges {
  @Input()
  filters: Object;

  @Output()
  filterChanges = new EventEmitter<Object>();

  @ViewChild('filterButton', {read: ElementRef}) filterButton: ElementRef;
  @ViewChild('filterFormTemplate') filterFormTemplate: TemplateRef<unknown>;

  isOpen: boolean = false;
  overlayRef: OverlayRef;
  filterFormTemplatePortal: TemplatePortal;
  animationPlayer: AnimationPlayer;
  overlayOutsideClickHandler: Function;

  closeOverlayAnimation: AnimationMetadata[] = [
    style({opacity: 1}),
    animate(100, style({opacity: 0}))
  ];

  filterForm: FormGroup = this.fb.group({
    startTime: this.dateRangeFormGroup(),
    endTime: this.dateRangeFormGroup()
  })

  dateRangeFormGroup(rangeJSON?: { start: string | null, end: string | null} | undefined): FormGroup {
    if (rangeJSON && Object.keys(rangeJSON).length > 0)
      return this.fb.group({
        start: rangeJSON.start? [new Date(rangeJSON.start)] : [null],
        end: rangeJSON.end? [new Date(rangeJSON.end)] : [null]
      });
    else
      return this.fb.group({ start: [null], end: [null] });
  }

  constructor(private fb: FormBuilder,
              private overlay: Overlay,
              private viewContainerRef: ViewContainerRef,
              private overlayContainer: OverlayContainer,
              private animationBuilder: AnimationBuilder) { }

  ngOnInit(): void { }

  ngAfterViewInit() {
    this.filterFormTemplatePortal = new TemplatePortal(this.filterFormTemplate, this.viewContainerRef);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('filters')) {
      this.filterForm = this.fb.group({
        startTime: this.dateRangeFormGroup(this.filters['startTime']),
        endTime: this.dateRangeFormGroup(this.filters['endTime'])
      })
    }
  }

  ngOnDestroy() {
    this.overlayRef?.dispose();
  }

  animateOverlayClosing() {
    const factory = this.animationBuilder.build(this.closeOverlayAnimation);
    this.animationPlayer = factory.create(this.overlayRef.overlayElement);
    this.animationPlayer.play();

    this.animationPlayer.onDone(()=> {
      this.overlayRef.detach();
      this.animationPlayer.destroy();
    });
  }

  openOverlay() {
    if(!this.overlayRef)
      this.overlayRef = this.overlay.create({
        positionStrategy: this.overlay.position()
          .flexibleConnectedTo(this.filterButton)
          .withPositions([{
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top'
          } as ConnectedPosition])
          .withPush(false),
        disposeOnNavigation: true,
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
        panelClass: 'custom-overlay-open-animation'
      });
    this.overlayRef.attach(this.filterFormTemplatePortal);
    this.overlayOutsideClickHandler = this.closeOverlayFromOutsideClick;
    this.isOpen = true;
  }

  closeOverlay() {
    this.animateOverlayClosing();
    this.overlayOutsideClickHandler = null;
    this.isOpen = false;
  }

  toggleOverlay() {
    if(!this.isOpen) {
      this.openOverlay();
    }
    else {
      this.closeOverlay();
    }
  }

  @HostListener('document:click', ['$event'])
  outsideClick(event) {
    if(this.overlayOutsideClickHandler) {
      this.overlayOutsideClickHandler(event);
    }
  }

  closeOverlayFromOutsideClick(event: MouseEvent) {
    if(!(this.overlayContainer.getContainerElement()).contains(event.target as HTMLElement) &&
      !(this.filterButton.nativeElement).contains(event.target)) {
      this.closeOverlay();
    }
  }

  onDatePickerStateChange(opened: boolean) {
    if(opened) {
      this.overlayContainer.getContainerElement().style.zIndex = '2000';
    }
    else {
      this.overlayContainer.getContainerElement().style.zIndex = '1000';
    }
  }

  applyFilters() {
    this.closeOverlay();
    this.filterChanges.emit(this.filterForm.value);
  }
}
