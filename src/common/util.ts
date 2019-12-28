import {Save} from '@l3tum/cpu-benchmark-common'

export function calculateOverallScore(save: Save): number {
    const keys = Object.keys(save.Results);
    let total_ac = 0;
    let number_ac = 0;

    keys.forEach(function (key) {
        if (!Array.isArray(save.Results[key])) {
            return;
        }

        let total = 0;
        let number = 0;

        for (const resultKey in save.Results[key]) {
            const result = save.Results[key][resultKey];

            if (result.hasOwnProperty('Benchmark') && result.Benchmark.startsWith('Category: all')) {
                total += result.Points;
                number++;

                break;
            }
        }

        total_ac += total;
        number_ac += number;
    });

    return parseInt((total_ac / number_ac).toFixed(0));
}
