import { Episode } from "../models/episode";

export type StatsResult = {
    avgDuration: { date: string; value: number }[];
    mostCommon: string | null;
    mostCommonCount: number;
    frequency: { date: string; count: number }[];
    symptomBreakdown: { symptom: string; count: number; percentage: number }[];
};

export function analyzeEpisodes(episodes: Episode[]): {
    last7Days: StatsResult;
    lastMonth: StatsResult;
    last6Months: StatsResult;
    lastYear: StatsResult;
} {
    const now = new Date();

    function formatDate(sec: number): string {
        return new Date(sec * 1000).toISOString().split("T")[0]; // yyyy-mm-dd
    }

    function getCalendarRanges() {
        const last7DaysStart = new Date();
        last7DaysStart.setDate(now.getDate() - 6);

        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const sixMonthsStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        const sixMonthsEnd = new Date(now.getFullYear(), now.getMonth() , 0);

        const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31);

        return {
            last7Days: { start: last7DaysStart, end: now },
            lastMonth: { start: lastMonthStart, end: lastMonthEnd },
            last6Months: { start: sixMonthsStart, end: sixMonthsEnd },
            lastYear: { start: lastYearStart, end: lastYearEnd },
        };
    }

    const ranges = getCalendarRanges();

    function getStats(range: { start: Date; end: Date }): StatsResult {
        const filtered = episodes.filter((e) => {
            const date = new Date((e.startTime?.seconds ?? 0) * 1000);
            return date >= range.start && date <= range.end;
        });

        if (filtered.length === 0) {
            return { avgDuration: [], mostCommon: null, mostCommonCount: 0, frequency: [],symptomBreakdown: [], };
        }

        const dayGroups: Record<
            string,
            { durations: number[]; count: number; symptoms: string[] }
        > = {};

        filtered.forEach((e) => {
            const day = formatDate(e.startTime.seconds);
            const start = e.startTime?.seconds ?? 0;
            const end = e.endTime?.seconds ?? start;
            const duration = Math.max(end - start, 0);

            if (!dayGroups[day]) {
                dayGroups[day] = { durations: [], count: 0, symptoms: [] };
            }

            dayGroups[day].durations.push(duration);
            dayGroups[day].count++;

            if (e.symptoms) {
                Object.entries(e.symptoms).forEach(([symptom, value]) => {
                    if (hasSymptomData(value)) {
                        dayGroups[day].symptoms.push(symptom);
                    }
                });
            }
        });

        const avgDuration = Object.entries(dayGroups)
            .map(([date, data]) => ({
                date,
                value:
                    data.durations.length > 0
                        ? data.durations.reduce((sum, d) => sum + d, 0) / data.durations.length
                        : 0,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        const symptomCounts: Record<string, number> = {};
        Object.values(dayGroups).forEach((data) => {
            data.symptoms.forEach((s) => {
                symptomCounts[s] = (symptomCounts[s] || 0) + 1;
            });
        });
        const [mostCommon, mostCommonCount] =
            Object.entries(symptomCounts).sort((a, b) => b[1] - a[1])[0] || [null, 0];

        const frequency = Object.entries(dayGroups)
            .map(([date, data]) => ({
                date,
                count: data.count,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));
        
            const totalSymptoms = Object.values(symptomCounts).reduce(
            (a, b) => a + b,
            0
        );

        const symptomBreakdown = Object.entries(symptomCounts).map(
            ([symptom, count]) => ({
                symptom,
                count,
                percentage: totalSymptoms
                    ? Number(((count / totalSymptoms) * 100).toFixed(2))
                    : 0,
            })
        );

        return { avgDuration, mostCommon, mostCommonCount, frequency ,symptomBreakdown};
    }

    function hasSymptomData(value: unknown): boolean {
        if (value === true) return true;
        if (typeof value === "object" && value !== null) {
            return Object.keys(value).length > 0;
        }
        return false;
    }

    return {
        last7Days: getStats(ranges.last7Days),
        lastMonth: getStats(ranges.lastMonth),
        last6Months: getStats(ranges.last6Months),
        lastYear: getStats(ranges.lastYear),
    };
}
