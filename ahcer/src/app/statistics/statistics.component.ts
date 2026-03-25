import { Component } from '@angular/core';
import { EpisodeService } from '../services/episode.service';
import { PatientServices } from '../services/patient.service';
import { UsersService } from '../services/users.service';
import { Episode } from '../models/episode';
import { Patient } from '../models/patient';
import { forkJoin, of, finalize, catchError, Subject } from "rxjs";
import { debounceTime } from 'rxjs/operators';
import { analyzeEpisodes, StatsResult } from './episode-utils';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent {
  private patientSelection$ = new Subject<any[]>();
  loadingPatient: boolean = false;
  episodes: Episode[] = [];
  patients: Patient[];
  currentPatient: Patient;
  episodes_count: number;
  loadedPatientsData: Patient[] = [];
  loadedPatientIds: string[] = [];
  loadingEpisodes: boolean = false;
  stats: {
    last7Days: StatsResult;
    lastMonth: StatsResult;
    last6Months: StatsResult;
    lastYear: StatsResult;
  };
  selectedRange: 'last7Days' | 'lastMonth' | 'last6Months' | 'lastYear' = 'last7Days';
  lastMonthName: string;
  lastYearNumber: number;

  get currentStat() {
    if (!this.stats) return null;
    return this.stats[this.selectedRange];
  }

  constructor(
    private episodeService: EpisodeService,
    private patientsService: PatientServices,
    private usersService: UsersService,
  ) { }

  ngOnInit(): void {
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    this.lastMonthName = prevMonth.toLocaleString('en-US', { month: 'long' });
    this.lastYearNumber = now.getFullYear() - 1;
    this.loadingPatient = true;
    if (this.usersService.isAdmin) {
      this.patientsService.getAllRecords().subscribe(
        patients => {
          this.patients = patients
          this.loadingPatient = false
          this.load()
        }
      )

    } else if (this.usersService.piUser) {
      this.patientsService.getAllRecords(this.usersService.piUser).subscribe(
        patients => {
          this.patients = patients
          this.loadingPatient = false
          this.load()

        })
    }
    else {
      this.patientsService.getPatients().subscribe(
        patients => { this.patients = patients })
      this.loadingPatient = false
      this.load()
    }
    this.patientSelection$
      .pipe(debounceTime(1200))
      .subscribe(selectedPatients => {
        this.changePatient(selectedPatients);
      });
  }
  load() {
    this.usersService.getLastViewedPatient().subscribe(
      (lastPatient) => {
        if (lastPatient) {
          const selectedPatient = this.patients?.find(
            p =>
              p.id === lastPatient.lastPatientViewed &&
              p.userId === lastPatient.lastPatientViewdUserId
          );
          if (selectedPatient) {
            this.patientSelection$.next([selectedPatient]);
          }
        }
        else {
          this.loadingPatient = false;
        }
      })
  }

  changePatient(patients: any[]) {
    this.episodes = [];
    this.episodes_count = 0;
    this.loadedPatientsData = patients;

    this.loadingEpisodes = true;

    const episodesObservables = patients.map(patient =>
      this.episodeService.getAllEpisodesByPatient(patient.id, 'desc', patient.userId).pipe(
        catchError(error => {
          console.error(`Episodes load failed for patient ${patient.id}`, error);
          return of([]);
        })
      )
    );

    forkJoin(episodesObservables)
      .pipe(
        finalize(() => {
          this.loadingEpisodes = false;
        })
      )
      .subscribe(episodesResults => {
        let allEpisodes = [];

        episodesResults.forEach((episodes, index) => {
          const patient = patients[index];
          const taggedEpisodes = episodes.map(ep => ({
            ...ep,
            patientId: patient.id,
            patientName: this.getPatientName(patient.id) || 'Unknown'
          }));
          allEpisodes = [...allEpisodes, ...taggedEpisodes];
        });

        this.episodes = allEpisodes;
        this.episodes_count = this.episodes.length;
        this.stats = analyzeEpisodes(this.episodes);
        this.updateChart();

      });
  }
  onPatientSelectionChange(patients: any[]) {
    this.patientSelection$.next(patients);
  }

  getPatientName(id: string): string {
    const selected = this.loadedPatientsData.find(p => p.id === id);
    return selected?.firstName || 'Unknown';
  }

  ngOnChanges() {
    this.updateChart();
  }

  // Chart Data and Options for Duration
  durationChartData: ChartData<'line'> = { labels: [], datasets: [] };
  durationChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const totalSec = Number(context.parsed.y);
            const hours = Math.floor(totalSec / 3600);
            const minutes = Math.floor((totalSec % 3600) / 60);
            const seconds = totalSec % 60;

            let formatted = '';
            if (hours > 0) formatted += `${hours}h `;
            if (minutes > 0 || hours > 0) formatted += `${minutes}m `;
            formatted += `${seconds}s`;

            return `${context.dataset.label}: ${formatted}`;
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => {
            const totalSec = Number(value);
            const days = Math.floor(totalSec / 86400);
            const hours = Math.floor(totalSec / 3600);
            const minutes = Math.floor((totalSec % 3600) / 60);
            const seconds = totalSec % 60;
            if(days > 0) {
              return `${days} day`;
            } else if (hours > 0) {
              return `${hours} hour ${minutes} minute ${seconds} second`;
            } else if (minutes > 0) {
              return `${minutes} minute ${seconds} second`;
            } else {
              return `${seconds} second`;
            }
          }
        }
      }
    }
  };


  // Chart Data and Options for Frequency
  frequencyChartData: ChartData<'line'> = { labels: [], datasets: [] };
  frequencyChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1 // ensures whole numbers
        },
        title: {
          display: true,
          text: 'Episode Count'
        }
      }
    }
  };
symptomPieData: ChartData<'pie'> = { labels: [], datasets: [] };


  updateChart() {
    if (!this.currentStat) return;

    const isMonthly =
      this.selectedRange === 'last6Months' || this.selectedRange === 'lastYear';
    const isDaily = !isMonthly;

    let labels: string[] = [];
    let avgData: number[] = [];
    let freqData: number[] = [];

    if (isMonthly) {
      const monthlyGroups: Record<string, { durations: number[]; totalCount: number }> = {};

      this.currentStat.avgDuration.forEach((d: any) => {
        const month = d.date.slice(0, 7); // yyyy-mm
        if (!monthlyGroups[month]) monthlyGroups[month] = { durations: [], totalCount: 0 };
        monthlyGroups[month].durations.push(d.value);
      });

      this.currentStat.frequency.forEach((f: any) => {
        const month = f.date.slice(0, 7);
        if (!monthlyGroups[month]) monthlyGroups[month] = { durations: [], totalCount: 0 };
        monthlyGroups[month].totalCount += f.count;
      });

      labels = Object.keys(monthlyGroups).sort();

      labels = labels.map(m => {
        const [year, month] = m.split('-');
        const date = new Date(Number(year), Number(month) - 1);
        const label = date.toLocaleString('en-US', { month: 'short' });
        return label.replace(/[-,]/g, '');
      });

      avgData = labels.map((_, idx) => {
        const key = Object.keys(monthlyGroups).sort()[idx];
        const d = monthlyGroups[key];
        if (d.durations.length === 0) return 0;
        const sum = d.durations.reduce((a, b) => a + b, 0);
        return sum / d.durations.length;
      });

      freqData = Object.keys(monthlyGroups)
        .sort()
        .map(m => monthlyGroups[m].totalCount);
    } else {
      labels = this.currentStat.frequency.map((f: any) => {
        const date = new Date(f.date);
        let label = '';

        if (this.selectedRange === 'last7Days') {
          label = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
          });
        } else if (this.selectedRange === 'lastMonth') {
          label = String(date.getDate());
        } else {
          label = f.date;
        }

        return label.replace(/[-,]/g, ''); // 🧹 Remove '-' and ','
      });

      avgData = this.currentStat.avgDuration.map((d: any) => d.value);
      freqData = this.currentStat.frequency.map((f: any) => f.count);
    }

    // Chart configs
    this.durationChartData = {
      labels,
      datasets: [
        {
          label: isMonthly ? 'Average Episode Length' : 'Average Episode Length',
          data: avgData,
          backgroundColor: 'rgba(54,162,235,0.6)',
          borderColor: 'blue',
          borderWidth: 1,
          tension: 0.3
        }
      ]
    };

    this.frequencyChartData = {
      labels,
      datasets: [
        {
          label: isMonthly ? 'Episodes That Month' : 'Episodes That Day',
          data: freqData,
          backgroundColor: 'rgba(255,99,132,0.6)',
          borderColor: 'red',
          borderWidth: 1,
          tension: 0.3
        }
      ]
    };
    this.symptomPieData = {
    labels: this.currentStat.symptomBreakdown.map(s => this.formatLabel(s.symptom) + '–' + Number(s.percentage.toFixed(0)) + '% '),
    datasets: [
      {
        data: this.currentStat.symptomBreakdown.map(s => Number(s.percentage.toFixed(0))),
        backgroundColor: ['red', 'blue', 'green', 'orange', 'purple'],
      }
    ]
}
  }
  setRange(range: 'last7Days' | 'lastMonth' | 'last6Months' | 'lastYear') {
  this.selectedRange = range;
  this.updateChart();
}
getAverageFor(range: keyof typeof this.stats): string {
  const data = this.stats[range].avgDuration;
  if (!data.length) return "0";

  const avg = data.reduce((a, b) => a + b.value, 0) / data.length;
  return this.formatDuration(avg);
}

formatDuration(totalSec: number): string {
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  if(days > 0) {
    return `${days} ${days === 1 ? 'day' : 'days'}`;;
  }else if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }
  return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
}
getTrend(range: keyof typeof this.stats): 'up' | 'down' | 'stable' {
  const freq = this.stats[range].frequency;
  if (freq.length < 2) return 'stable';

  // Prepare values
  const y = freq.map(f => f.count);
  const x = freq.map((_, i) => i);

  // Linear regression slope
  const n = y.length;
  const sumX = x.reduce((a,b)=>a+b,0);
  const sumY = y.reduce((a,b)=>a+b,0);
  const sumXY = x.reduce((acc,i)=>acc + x[i] * y[i], 0);
  const sumX2 = x.reduce((acc,i)=>acc + x[i] * x[i], 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  if (slope > 0.05) return 'up';
  if (slope < -0.05) return 'down';
  return 'stable';
}
getChangePercentage(range: 'last7Days' | 'lastMonth' | 'last6Months' | 'lastYear') {
  const current = this.getAverageRaw(range);
  const prev = this.getPreviousRangeAverage(range);

  if (!prev) return null;

  const diff = ((current - prev) / prev) * 100;
  return diff;
}

getAverageRaw(range: keyof typeof this.stats): number {
  const data = this.stats[range].avgDuration;
  if (!data.length) return 0;
  return data.reduce((a, b) => a + b.value, 0) / data.length;
}

getPreviousRangeAverage(range: string) {
  if (range === 'last7Days') return this.getAverageRaw('lastMonth');
  if (range === 'lastMonth') return this.getAverageRaw('last6Months');
  if (range === 'last6Months') return this.getAverageRaw('lastYear');
  return null;
}
rangeLabels: Record<string, string> = {
  last7Days: "Last 7 Days",
  lastMonth: "Last Month",
  last6Months: "Last 6 Months",
  lastYear: "Last Year"
};

getRangeLabel(range: string): string {
  return this.rangeLabels[range] || range;
}
get totalEpisodes(): number {
  return this.currentStat?.frequency?.reduce(
    (sum, item) => sum + item.count,
    0
  ) ?? 0;
}
private getMonthYear(date: Date): string {
  return date.toLocaleString('default', {
    month: 'short',
    year: 'numeric'
  });
}
get countLabels(): Record<string, string> {
  const now = new Date();

  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const last6MonthsStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const lastYear = new Date(now.getFullYear() - 1, 0, 1);

  return {
    last7Days: `Last 7 Days (${this.getMonthYear(now)})`,

    lastMonth: this.getMonthYear(lastMonth),

    last6Months: `${this.getMonthYear(last6MonthsStart)} - ${this.getMonthYear(now)}`,

    lastYear: `${lastYear.getFullYear()}`
  };
}
getCountLabel(range: string): string {
  return this.countLabels[range] || range;
}
formatLabel(value: string): string {
  if (!value) return 'None';

  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .replace(/\b\w/g, char => char.toUpperCase());
}
}
