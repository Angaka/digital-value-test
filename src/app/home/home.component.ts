import { Component, OnInit, OnDestroy } from '@angular/core';
import { VolumeService } from '../core/services/volume.service';
import { takeUntil, flatMap, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Category } from '../shared/models/category.model';
import { ChartDataSets } from 'chart.js';
import { Label, Color } from 'ng2-charts';
import { Volume } from '../shared/models/volume.model';
import { FormControl } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';

import { Moment } from 'moment';
import * as moment from 'moment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  private unsubscribe = new Subject();

  // Chart properties to set
  public datasets: ChartDataSets[];
  public labels: Label[];
  public colors: Color[];

  public defaultCategory: Category;  // Root by default
  public selectedCategory: Category;
  public selectedVolumes: Volume[];

  // Default min and max periods used by datepickers when a category is selected
  public minPeriod: Moment;
  public maxPeriod: Moment;

  // Values to display for both datepicker inputs
  public minPeriodForm: FormControl;
  public maxPeriodForm: FormControl;

  // Properties used for selecting a custom period between two dates
  public selectedMinPeriod: Moment;
  public selectedMaxPeriod: Moment;

  constructor(private volumeService: VolumeService) {
    this.colors = [
      {
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        pointBackgroundColor: '#fff',
        pointBorderColor: 'rgb(255, 99, 132)',
        pointHoverBackgroundColor: 'rgb(255, 99, 132)',
        pointHoverBorderColor: 'rgb(255, 99, 132)',
      }
    ];

    this.minPeriodForm = new FormControl(moment());
    this.maxPeriodForm = new FormControl(moment());
    this.selectedMinPeriod = moment();
    this.selectedMaxPeriod = moment();

    this.initChart();
  }

  ngOnInit() {
    console.log('HomeComponent');
    this.volumeService.getCategory()
      .pipe(
        takeUntil(this.unsubscribe),
        tap((category) => {
          this.defaultCategory = category;
          this.selectedCategory = category;
          this.selectVolumes(this.defaultCategory);
        }),
      )
      .subscribe();

    this.volumeService.getSelectedCategory()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((category) => {
        this.selectedCategory = category;
        this.selectVolumes(category);
      });
  }

  /**
   * Method to get the volumes associated with a category
   * 
   * @param category
   */
  private selectVolumes(category: Category) {
    console.log('selectVolumes ' + category.id);

    this.volumeService.getVolumes(category.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((volumes) => {
        console.log(`volumes: ${JSON.stringify(volumes)}`);
        this.selectedCategory = category;
        this.selectedVolumes = volumes;

        const volumesTimespans = this.selectedVolumes.map((v) => v.timespan);

        this.minPeriod = moment(volumesTimespans[0]); // Set the oldest timespan
        this.maxPeriod = moment(volumesTimespans[volumesTimespans.length - 1]); // Set the most recent timespan

        this.selectedMinPeriod = moment(volumesTimespans[volumesTimespans.length - 13]); // For the first time is set the previous months
        this.selectedMaxPeriod = this.maxPeriod;

        const selectedPeriodVolumes = this.selectedVolumes
          .filter((v) => {
            return moment(v.timespan).isBetween(this.selectedMinPeriod, this.selectedMaxPeriod, 'month', '[]');
          });

        const data = selectedPeriodVolumes.map((v) => v.volume);
        const labels = selectedPeriodVolumes.map((v) => v.timespan);

        this.initChart(data, category.name, labels);
      });
  }

  /**
   * Method to update datepicker inputs and chart itself
   *
   * @param data Volumes set in Y axis of the chart
   * @param currentLabel Selected category name that appear at the top of the chart
   * @param labels Timespans set in X axis of the chart
   */
  private initChart(data: number[] = [],
                    currentCategoryName: string = '',
                    labels: Label[] = []) {
    this.datasets = [
      { data, label: currentCategoryName }
    ];
    this.labels = labels;

    this.minPeriodForm.setValue(this.selectedMinPeriod);
    this.maxPeriodForm.setValue(this.selectedMaxPeriod);
  }

  /**
   * Method called when a date is selected in datepicker
   *
   * @param period Selected period
   * @param datepicker A reference to the datepicker
   * @param isMin Check if the picked period is the minimum period or not. Default value is true
   */
  public onSelectedMonth(period: Moment, datepicker: MatDatepicker<Moment>, isMin = true) {
    if (isMin) {
      this.selectedMinPeriod = period;
    } else {
      this.selectedMaxPeriod = period;
    }

    const selectedPeriodVolumes = this.selectedVolumes.filter((v) => {
      return moment(v.timespan).isBetween(this.selectedMinPeriod, this.selectedMaxPeriod, 'month', '[]');
    });

    const data = selectedPeriodVolumes.map((v) => v.volume);
    const labels = selectedPeriodVolumes.map((v) => v.timespan);

    this.initChart(data, this.selectedCategory.name, labels);

    datepicker.close();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.unsubscribe();
  }
}
