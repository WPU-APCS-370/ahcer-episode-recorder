import {
  AfterViewInit,
  Component,
  ElementRef, EventEmitter,
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
import moment, {Moment} from "moment";

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

  presetDateChips: string[] = ['This Week', 'Last Week', 'This Month', 'Last Month', 'Last Year'];
  selectedPresetDate: {[key in 'startTime' | 'endTime']:  number} = {startTime: -1, endTime: -1};
  presetDateMatches: {[key in 'startTime' | 'endTime']: {start: number[], end: number[]}} = {
    startTime: {start: [], end: []},
    endTime: {start: [], end: []}
  }

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
      for (let x of ['startTime', 'endTime'] as const) {
        this.checkRangeDateWithPreset(x, this.filters[x]?.start, this.filters[x]?.end);
      }
    }
  }

  ngOnDestroy() {
    this.overlayRef?.dispose();
  }

  animateOverlayClosing() {
    let animationPlayer: AnimationPlayer;
    const factory = this.animationBuilder.build(this.closeOverlayAnimation);
    animationPlayer = factory.create(this.overlayRef.overlayElement);
    animationPlayer.onDone(()=> {
      this.overlayRef.detach();
      animationPlayer.destroy();
    });
    animationPlayer.play();
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
          .withPush(true),
        disposeOnNavigation: true,
        panelClass: 'custom-overlay-open-animation',
        hasBackdrop: true,
        backdropClass: 'cdk-overlay-transparent-backdrop'
      });
    this.overlayRef.attach(this.filterFormTemplatePortal);
    this.overlayRef.backdropClick().subscribe(()=> {
      this.closeOverlay();
    })
  }

  closeOverlay() {
    this.animateOverlayClosing();
  }

  applyFilters() {
    this.closeOverlay();
    this.filterChanges.emit(this.filterForm.value);
  }

  jsonObjectIsEmpty(object: Object) {
    return !object || (Object.keys(object).length <=0);
  }

  dateChipOnClick(index: number, chipFor: 'startTime' | 'endTime'): void {
    if (this.selectedPresetDate[chipFor] == index) {
      this.selectedPresetDate[chipFor] = -1;
      this.filterForm.get(chipFor).get('start').setValue(null);
      this.filterForm.get(chipFor).get('end').setValue(null);
    }
    else {
      this.selectedPresetDate[chipFor] = index;
      let start: Moment, end: Moment = null;
      switch (index) {
        case 0:
          start = moment().startOf('week');
          break;
        case 1:
          start = moment().subtract(1, 'week').startOf('week');
          end = moment().subtract(1, 'week').endOf('week').startOf('day');
          break;
        case 2:
          start = moment().startOf('month');
          break;
        case 3:
          start = moment().subtract(1, 'month').startOf('month');
          end = moment().subtract(1, 'month').endOf('month').startOf('day');
          break;
        case 4:
          start = moment().subtract(1, 'year').startOf('year');
          end = moment().subtract(1, 'year').endOf('year').startOf('day');
          break;
      }
      this.filterForm.get(chipFor).get('start').setValue(start.toDate());
      if(end)
        this.filterForm.get(chipFor).get('end').setValue(end.toDate());
      else
        this.filterForm.get(chipFor).get('end').setValue(null);
    }
  }

  checkRangeDateWithPreset(checkFor: 'startTime' | 'endTime', start?: Date, end?: Date) {
    if(typeof start == 'undefined' && typeof end == 'undefined')
      this.presetDateMatches[checkFor] = {start: [], end: []};

    if(typeof start != 'undefined') {
      let startMoment: Moment = start? moment(start).startOf('day') : null;
      let datesToCompare: Moment[] = [
        moment().startOf('week'),                                   //This Week
        moment().subtract(1, 'week').startOf('week'),   //Last Week
        moment().startOf('month'),                                  //This Month
        moment().subtract(1, 'month').startOf('month'), //Last Month
        moment().subtract(1, 'year').startOf('year')    //Last Year
      ];
      this.presetDateMatches[checkFor].start =
        datesToCompare.reduce(function(a, e, i) {
          if (e.isSame(startMoment))
            a.push(i);
          return a;
        }, [])
    }

    if(typeof end != 'undefined') {
      let endMoment: Moment = end? moment(end).startOf('day') : null;
      let datesToCompare: Moment[] = [
        null,                                                                                       //This Week
        moment().subtract(1, 'week').endOf('week').startOf('day'),   //Last Week
        null,                                                                                       //This Month
        moment().subtract(1, 'month').endOf('month').startOf('day'), //Last Month
        moment().subtract(1, 'year').endOf('year').startOf('day')    //Last Year
      ];
      this.presetDateMatches[checkFor].end =
        datesToCompare.reduce(function(a, e, i) {
          if(e) {
            if (e.isSame(endMoment))
              a.push(i);
          }
          else {
            if (e == endMoment)
              a.push(i);
          }
          return a;
        }, [])
    }
    for(let index of this.presetDateMatches[checkFor].start) {
      if(this.presetDateMatches[checkFor].end.includes(index)) {
        this.selectedPresetDate[checkFor] = index;
        return;
      }
    }
    this.selectedPresetDate[checkFor] = -1;
  }
}
