import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import * as Highcharts from 'highcharts';
import * as DrilldownModule from 'highcharts/modules/drilldown';

(DrilldownModule as any).default(Highcharts);

console.log('Drilldown loaded:', !!(Highcharts as any).Chart?.prototype?.addSeriesAsDrilldown);

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
