import { Component, OnInit, OnDestroy } from '@angular/core';
import { VolumeService } from '../core/services/volume.service';
import { takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Category } from '../shared/models/category.model';

import { ChartDataSets, ChartOptions } from 'chart.js';
import { Label, Color } from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';

import { Volume } from '../shared/models/volume.model';
import { FormControl } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';

import { Moment } from 'moment';
import * as moment from 'moment';
import * as Chart from 'chart.js';

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
  public plugins: Chart.ChartPluginsOptions;
  public options: (ChartOptions & { annotation: any }) = {
    responsive: true,
    scales: {},
    annotation: {
      annotations: [
        {
          type: 'line',
          mode: 'horizontal',
          scaleID: 'y-axis-0',
          value: 0,
          borderColor: '#4BC0C0',
          borderWidth: 2,
          label: {
            enabled: true,
            fontColor: 'white',
            content: 'Volume moyen pour la période actuelle'
          }
        },
        {
          type: 'line',
          mode: 'horizontal',
          scaleID: 'y-axis-0',
          value: 0,
          borderColor: '#fed976',
          borderWidth: 2,
          label: {
            enabled: true,
            fontColor: 'white',
            content: 'Volume moyen par rapport à l\'année dernière'
          }
        },
      ],
    },
  };

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
    this.plugins = [pluginAnnotations];

    this.minPeriodForm = new FormControl(moment());
    this.maxPeriodForm = new FormControl(moment());
    this.selectedMinPeriod = moment();
    this.selectedMaxPeriod = moment();

    this.selectedVolumes = [];

    this.initChart();
  }

  ngOnInit() {
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

        this.initChart(category.name);
      });
  }

  /**
   * Method to update datepicker inputs and chart itself
   *
   * @param data Volumes set in Y axis of the chart
   * @param currentLabel Selected category name that appear at the top of the chart
   * @param labels Timespans set in X axis of the chart
   */
  private initChart(currentCategoryName: string = '') {
    const selectedPeriodVolumes = this.selectedVolumes
      .filter((v) => {
        return moment(v.timespan).isBetween(this.selectedMinPeriod, this.selectedMaxPeriod, 'month', '[]');
      });

    const data = selectedPeriodVolumes.map((v) => v.volume);
    const labels = selectedPeriodVolumes.map((v) => v.timespan);

    this.datasets = [
      { data, label: currentCategoryName }
    ];
    this.labels = labels;

    this.minPeriodForm.setValue(this.selectedMinPeriod);
    this.maxPeriodForm.setValue(this.selectedMaxPeriod);

    this.updateChartOptions();
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

    this.initChart(this.selectedCategory.name);
    datepicker.close();
  }

  /**
   * Method for chart options update.
   * Used when we want to refresh the average lines render in the chart
   */
  private updateChartOptions() {
    const selectedPeriodVolumesAverage = this.getAverageVolumes(this.selectedMinPeriod, this.selectedMaxPeriod);
    const lastYearMinPeriod = moment(this.selectedMinPeriod).subtract(1, 'year');
    const lastYearMaxPeriod = moment(this.selectedMaxPeriod).subtract(1, 'year');
    const lastYearPeriodVolumesAverage = this.getAverageVolumes(lastYearMinPeriod, lastYearMaxPeriod);
    console.log(`lastYear: ${lastYearMinPeriod} ${lastYearMaxPeriod} ${lastYearPeriodVolumesAverage}`);

    // Workaround because of chartjs-annotations issue that involves annotations are not updated.
    Chart.helpers.each(Chart.instances, (instance) => {
      console.log(instance);
      const currentPeriod = instance.options.annotation.annotations[0];
      currentPeriod.value = selectedPeriodVolumesAverage;
      currentPeriod.label.content = `Volume moyen entre ${this.selectedMinPeriod.format('L')} et ${this.selectedMaxPeriod.format('L')}`;
      const lastYearPeriod = instance.options.annotation.annotations[1];
      lastYearPeriod.value = lastYearPeriodVolumesAverage;
      lastYearPeriod.label.content = `Volume moyen entre ${lastYearMinPeriod.format('L')} et ${lastYearMaxPeriod.format('L')}`;
    });
  }

  private getAverageVolumes(minPeriod: Moment, maxPeriod) {
    const selectedPeriodVolumes = this.selectedVolumes.filter((v) => {
      return moment(v.timespan).isBetween(minPeriod, maxPeriod, 'month', '[]');
    });

    if (minPeriod.isBefore(maxPeriod) && selectedPeriodVolumes.length > 0) {
      const periodVolumesSum = selectedPeriodVolumes
        .map((v) => v.volume)
        .reduce((volumeA, volumeB) => volumeA + volumeB);

      const monthsCount = this.selectedMaxPeriod.diff(this.selectedMinPeriod, 'month', true) + 1;

      console.log(`getAverageVolumes() periodVolumesSum: ${periodVolumesSum} ${monthsCount}`);
      return Math.round(periodVolumesSum / monthsCount);
    }

    return 0;
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.unsubscribe();
  }
}
