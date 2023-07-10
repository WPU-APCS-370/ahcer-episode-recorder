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
import {UntypedFormBuilder, UntypedFormGroup} from "@angular/forms";
import {ConnectedPosition, Overlay, OverlayContainer, OverlayRef} from "@angular/cdk/overlay";
import {TemplatePortal} from "@angular/cdk/portal";
import {
  animate,
  AnimationBuilder,
  AnimationMetadata,
  AnimationPlayer,
  style
} from "@angular/animations";
import {DateTime} from "luxon";

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

  filterForm: UntypedFormGroup = this.fb.group({
    startTime: this.dateRangeFormGroup(),
    endTime: this.dateRangeFormGroup()
  })

  dateRangeFormGroup(rangeJSON?: { start: string | null, end: string | null} | undefined): UntypedFormGroup {
    if (rangeJSON && Object.keys(rangeJSON).length > 0)
      return this.fb.group({
        start: rangeJSON.start? [new Date(rangeJSON.start)] : [null],
        end: rangeJSON.end? [new Date(rangeJSON.end)] : [null]
      });
    else
      return this.fb.group({ start: [null], end: [null] });
  }

  constructor(private fb: UntypedFormBuilder,
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

  sundayStartOfWeek(dateTime: DateTime): DateTime {
    return dateTime.startOf('week')
      .plus({ weeks: dateTime.weekdayShort === 'Sun' ? 1 : 0 })
      .minus({ days: 1 })
  }

  dateChipOnClick(index: number, chipFor: 'startTime' | 'endTime'): void {
    if (this.selectedPresetDate[chipFor] == index) {
      this.selectedPresetDate[chipFor] = -1;
      this.filterForm.get(chipFor).get('start').setValue(null);
      this.filterForm.get(chipFor).get('end').setValue(null);
    }
    else {
      this.selectedPresetDate[chipFor] = index;
      let start: DateTime, end: DateTime = null;
      switch (index) {
        case 0:
          start = this.sundayStartOfWeek(DateTime.now());
          break;
        case 1:
          start = this.sundayStartOfWeek(DateTime.now().minus({weeks: 1}));
          end = this.sundayStartOfWeek(DateTime.now()).minus({days: 1}).startOf('day');
          break;
        case 2:
          start = DateTime.now().startOf('month');
          break;
        case 3:
          start = DateTime.now().minus({months: 1}).startOf('month');
          end = DateTime.now().minus({months: 1}).endOf('month').startOf('day');
          break;
        case 4:
          start = DateTime.now().minus({years: 1}).startOf('year');
          end = DateTime.now().minus({years: 1}).endOf('year').startOf('day');
          break;
      }
      this.filterForm.get(chipFor).get('start').setValue(start.toJSDate());
      if(end)
        this.filterForm.get(chipFor).get('end').setValue(end.toJSDate());
      else
        this.filterForm.get(chipFor).get('end').setValue(null);
    }
  }

  checkRangeDateWithPreset(checkFor: 'startTime' | 'endTime', start?: Date, end?: Date) {
    if(typeof start == 'undefined' && typeof end == 'undefined')
      this.presetDateMatches[checkFor] = {start: [], end: []};

    if(typeof start != 'undefined') {
      let startLuxon: DateTime = start ? DateTime.fromJSDate(start) : null;
      let datesToCompare: DateTime[] = [
        this.sundayStartOfWeek(DateTime.now()),                            //This Week
        this.sundayStartOfWeek(DateTime.now().minus({weeks: 1})),  //Last Week
        DateTime.now().startOf('month'),                              //This Month
        DateTime.now().minus({months: 1}).startOf('month'),   //Last Month
        DateTime.now().minus({years: 1}).startOf('year')      //Last Year
      ];
      this.presetDateMatches[checkFor].start = (startLuxon === null) ? [] :
        datesToCompare.reduce(function (a, e, i) {
          if (e.hasSame(startLuxon, 'day'))
            a.push(i);
          return a;
        }, []);
    }

    if(typeof end != 'undefined') {
      let endLuxon: DateTime = end ? DateTime.fromJSDate(end) : null;
      let datesToCompare: DateTime[] = [
        null,                                                            //This Week
        this.sundayStartOfWeek(DateTime.now()).minus({days: 1}), //Last Week
        null,                                                            //This Month
        DateTime.now().minus({months: 1}).endOf('month'),    //Last Month
        DateTime.now().minus({years: 1}).endOf('year')       //Last Year
      ];
      this.presetDateMatches[checkFor].end = (endLuxon === null) ? [0, 2] :
        datesToCompare.reduce(function (a, e, i) {
          if (e !== null) {
            if (e.hasSame(endLuxon, 'day'))
              a.push(i);
          }
          return a;
        }, []);
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
