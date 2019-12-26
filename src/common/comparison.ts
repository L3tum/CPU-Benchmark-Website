import {Chart} from "chart.js";
import {vendor_colors} from './vendor_colors';

export function renderComparisonGraph(context: HTMLCanvasElement, self_score: number = 0, self_name: string = "", other_scores: string = "", title: string = "Points", max_entries: number = 10, score_limit: number = 10000): Promise<boolean> {
    return new Promise((resolve, reject) => {
        fetch(other_scores).then(scoresJSON => {
            if (!scoresJSON.ok) {
                resolve(false);

                return;
            }

            scoresJSON.json().then(scores => {
                const comparisons: Array<Record<string, any>> = [
                    {
                        'name': 'You',
                        'value': self_score,
                        'color': '#008000'
                    }
                ];

                for (const entry of scores.Entries) {
                    const parts: Array<string> = entry.Value.split(' === ');
                    const points: number = parseInt(parts[2]);

                    if (comparisons.length < max_entries && self_score <= points + score_limit && self_score >= points - score_limit) {
                        comparisons.push({
                            'name': parts[0] === self_name ? 'Average' : parts[0],
                            'value': points,
                            'color': vendor_colors[parts[1]]
                        });
                    }
                }

                if (comparisons.length > 1) {
                    const lowest = Math.round(comparisons[comparisons.length - 1].value - 10000 > 0 ? (comparisons[comparisons.length - 1].value - 10000) / 10000 : 0) * 10000;
                    const highest = Math.round(comparisons[0].value + 10000 < 100000 ? (comparisons[0].value + 10000) / 10000 : 10000) * 10000;

                    renderComparison(comparisons, context, highest, lowest, title);
                    resolve(true);
                }

                resolve(false);
            });
        });
    });
}

export function renderComparison(comparisons: Array<Record<string, any>>, context: HTMLCanvasElement, highest: number = 0, lowest: number = 0, label: string = 'Points') {
    comparisons.sort(function (a, b) {
        if (a.value > b.value) {
            return -1;
        }

        if (b.value > a.value) {
            return 1;
        }

        return 0;
    });

    const myChart = new Chart(context, {
        type: 'horizontalBar',
        data: {
            labels: comparisons.map((comparison) => comparison.name),
            datasets: [{
                label: label,
                data: comparisons.map((comparison) => comparison.value),
                backgroundColor: comparisons.map((comparison) => comparison.color),
                // borderColor: [
                //     'rgba(255, 99, 132, 1)',
                //     'rgba(54, 162, 235, 1)',
                //     'rgba(255, 206, 86, 1)',
                //     'rgba(75, 192, 192, 1)',
                //     'rgba(153, 102, 255, 1)',
                //     'rgba(255, 159, 64, 1)'
                // ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    ticks: {
                        beginAtZero: true,
                        min: lowest,
                        max: highest
                    }
                }],
                yAxes: [{
                    stacked: true
                }]
            }
        }
    });
}
