import $ from 'jquery';
import {
    getACAverageAggregationUrl,
    getAverageAggregationUrl,
    getSCAverageAggregationUrl,
    getSingleSaveUrl
} from "./common/github";
import {wiki_links} from "./common/wiki_links_feature_flags";
import {vendor_colors} from "./common/vendor_colors";
import {renderComparison, renderComparisonGraph} from "./common/comparison";
import detailTemplate from './templates/detail_template.msc'
import {calculateOverallScore} from "./common/util";
import {Save} from "@l3tum/cpu-benchmark-common";

let renderPromise = new Promise((resolve) => resolve());
let average = null;
let score = 0.0;

function error() {
    $('#accordion').html("<h5>Can't find the specified save!</h5>")
}

function fetchAveragePointsAroundScore(nameToSkip: string, limit: number = 10000): Promise<Array<Record<string, any>>> {
    return new Promise((resolve, reject) => {
        fetch(getAverageAggregationUrl()).then(averagesJSON => {
            if (!averagesJSON.ok) {
                resolve([]);
                return;
            }

            averagesJSON.json().then(averages => {
                const parsedAverages = [];
                const promises = [];

                for (const entry of averages.Entries) {
                    if (entry.Value === nameToSkip) {
                        continue;
                    }

                    promises.push(new Promise((resolve1 => {
                        fetch(getSingleSaveUrl(entry.SaveFile)).then(averageSaveFileJSON => {
                            if (!averageSaveFileJSON.ok) {
                                resolve1();
                            }

                            averageSaveFileJSON.json().then(averageSaveFile => {
                                const averageScore = calculateOverallScore(averageSaveFile);

                                if (averageScore <= score + limit && averageScore >= score - limit) {
                                    parsedAverages.push({
                                        'name': averageSaveFile.MachineInformation.Cpu.Name,
                                        'value': averageScore,
                                        'color': vendor_colors[averageSaveFile.MachineInformation.Cpu.Vendor]
                                    });
                                }

                                resolve1();
                            });
                        });
                    })));
                }

                Promise.all(promises).then(() => {
                    resolve(parsedAverages);
                });
            });
        });
    });
}

function renderPointsComparisonGraph(save: Save): Promise<void> {
    return new Promise((resolve, reject) => {
        fetch(getSingleSaveUrl(`average_${save.MachineInformation.Cpu.Caption.replace('@', 'at').replace(/ /g, '_').replace(/,/g, '_')}.automated`)).then(json => {
            let averagePromise = new Promise((resolve1) => resolve1());

            if (json.ok) {
                averagePromise = json.json().then(averaged => {
                    return new Promise((resolve1) => {
                        average = averaged;
                        resolve1();
                    });
                });
            }

            Promise.all([averagePromise, renderPromise]).then(() => {
                fetchAveragePointsAroundScore(save.MachineInformation.Cpu.Caption).then(averages => {
                    const comparisons = [
                        {'name': 'You', 'value': score, 'color': '#008000'},
                        ...averages
                    ];

                    if (average !== null) {
                        comparisons.push(
                            {
                                'name': 'Average',
                                'value': calculateOverallScore(average),
                                'color': vendor_colors[average.MachineInformation.Cpu.Vendor]
                            });
                    }

                    if (comparisons.length > 1) {
                        const lowest = Math.round(comparisons[comparisons.length - 1].value - 10000 > 0 ? (comparisons[comparisons.length - 1].value - 10000) / 10000 : 0) * 10000;
                        const highest = Math.round(comparisons[0].value + 10000 < 100000 ? (comparisons[0].value + 10000) / 10000 : 10000) * 10000;

                        renderComparison(comparisons, document.getElementById('score_comparison') as HTMLCanvasElement, highest, lowest)
                    }

                    resolve();
                });
            });
        });
    });
}

function renderSCComparisonGraph(save: Save): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!(1 in save.Results)) {
            document.getElementById('sc_average').classList.add('d-none');
            resolve();
            return;
        }

        renderPromise.then(() => {
            renderComparisonGraph(document.getElementById('sc_comparison') as HTMLCanvasElement, save.Results[1].find(bench => bench.Benchmark === "Category: all").Points, save.MachineInformation.Cpu.Name, getSCAverageAggregationUrl()).then((success) => {
                if (!success) {
                    document.getElementById('sc_average').classList.add('d-none');
                }

                resolve();
            });
        });
    });
}

function renderACComparisonGraph(save: Save): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!(save.MachineInformation.Cpu.LogicalCores in save.Results)) {
            document.getElementById('ac_average').classList.add('d-none');
            resolve();
            return;
        }

        renderPromise.then(() => {
            renderComparisonGraph(document.getElementById('ac_comparison') as HTMLCanvasElement, save.Results[save.MachineInformation.Cpu.LogicalCores].find(bench => bench.Benchmark === "Category: all").Points, save.MachineInformation.Cpu.Name, getACAverageAggregationUrl(save.MachineInformation.Cpu.LogicalCores)).then((success) => {
                if (!success) {
                    document.getElementById('ac_average').classList.add('d-none');
                }

                resolve();
            });
        });
    });
}

export function renderResults(save: Save): Record<string, Array<{ name: string; value: string; } | { name: string; value: number; }>> {
    const results_all = [];
    const results_categories = [];
    const results_detailed = [];
    const keys = Object.keys(save.Results);

    keys.forEach(function (key) {
        if (!Array.isArray(save.Results[key])) {
            return;
        }

        save.Results[key].forEach(function (result) {
            if (result.Benchmark.startsWith('Category: all')) {
                results_all.push({
                    value: result.Points,
                    name: `${key} ${parseInt(key) === 1 ? 'Threads' : 'Threads'}`
                });
            } else if (result.Benchmark.startsWith('Category:')) {
                results_categories.push({
                    value: result.Points,
                    name: `${result.Benchmark.replace('Category: ', '')} @ ${key} ${parseInt(key) === 1 ? 'Threads' : 'Threads'}`
                });
            } else {
                results_detailed.push({
                    value: result.Points,
                    name: `${result.Benchmark} @ ${key} ${parseInt(key) === 1 ? 'Threads' : 'Threads'}`
                });
            }
        });
    });

    return {'all': results_all, 'categories': results_categories, 'detailed': results_detailed};
}

function renderFeatureFlags(save: Save): Array<{ name: string; value: string; } | { name: string; value: number; }> {
    let feature_flags = [
        {
            name: 'Feature Flags',
            value: `${save.MachineInformation.Cpu.FeatureFlagsOne}, ${save.MachineInformation.Cpu.FeatureFlagsTwo}`
        },
        {
            name: 'Extended Feature Flags',
            value: `${save.MachineInformation.Cpu.ExtendedFeatureFlagsF7One},
        ${save.MachineInformation.Cpu.ExtendedFeatureFlagsF7Two},
        ${save.MachineInformation.Cpu.ExtendedFeatureFlagsF7Three}`
        },
        {
            name: 'AMD Feature Flags',
            value: `${save.MachineInformation.Cpu.AMDFeatureFlags.ExtendedFeatureFlagsF81One},
        ${save.MachineInformation.Cpu.AMDFeatureFlags.ExtendedFeatureFlagsF81Two},
        ${save.MachineInformation.Cpu.AMDFeatureFlags.FeatureFlagsSvm},
        ${save.MachineInformation.Cpu.AMDFeatureFlags.FeatureFlagsApm}`
        },
        {
            name: 'Intel Feature Flags',
            value: `${save.MachineInformation.Cpu.IntelFeatureFlags.TPMFeatureFlags},
        ${save.MachineInformation.Cpu.IntelFeatureFlags.ExtendedFeatureFlagsF81One},
        ${save.MachineInformation.Cpu.IntelFeatureFlags.ExtendedFeatureFlagsF81Two},
        ${save.MachineInformation.Cpu.IntelFeatureFlags.FeatureFlagsApm}`
        }
    ];

    for (const entry of feature_flags) {
        for (const wikiLinksKey in wiki_links) {
            entry.value = entry.value.replace(new RegExp(`([^a-zA-Z0-9_])${wikiLinksKey}(?![a-zA-Z0-9_]+)(,?)`, "g"), `$1<a href="${wiki_links[wikiLinksKey]}" target="_blank">${wikiLinksKey}</a>$2`);
        }

        entry.value = entry.value.replace(/,? ?NONE(,?)/g, '$1').replace(/,\W*,/g, ',').replace(/,\W*$/g, '');
    }

    return feature_flags;
}

export function renderInfo(save: Save): Array<{ name: string; value: string; } | { name: string; value: number; }> {
    let info = [
        {
            name: 'Caption',
            value: save.MachineInformation.Cpu.Caption
        },
        {
            name: 'Vendor',
            value: save.MachineInformation.Cpu.Vendor
        },
        {
            name: 'Cores',
            value: save.MachineInformation.Cpu.PhysicalCores,
        },
        {
            name: 'Threads',
            value: save.MachineInformation.Cpu.LogicalCores
        },
        {
            name: 'NUMA',
            value: `${save.MachineInformation.Cpu.Nodes} Node${save.MachineInformation.Cpu.Nodes === 1 ? '' : 's'} @ ${save.MachineInformation.Cpu.LogicalCoresPerNode} Threads per Node`
        },
        {
            name: 'Frequency',
            value: `${(save.MachineInformation.Cpu.MaxClockSpeed / 1000).toFixed(2)} GHz Measured / ${(save.MachineInformation.Cpu.NormalClockSpeed / 1000).toFixed(2)} GHz Reported`
        },
        {
            name: 'Socket',
            value: save.MachineInformation.Cpu.Socket
        },
        {
            name: 'BIOS',
            value: `${save.MachineInformation.SmBios.BIOSCodename} ${save.MachineInformation.SmBios.BIOSVersion} by ${save.MachineInformation.SmBios.BIOSVendor}`
        },
        {
            name: 'Mainboard',
            value: `${save.MachineInformation.SmBios.BoardName} ${save.MachineInformation.SmBios.BoardVersion} by ${save.MachineInformation.SmBios.BoardVendor}`
        }
    ];

    let cores = '';

    save.MachineInformation.Cpu.Cores.forEach(function (core) {
        cores += `#${core.Number.toString().padStart(2, '0')} ${(core.MaxClockSpeed / 1000).toFixed(2)} GHz${(core.Number + 1) % 3 === 0 ? '\n' : '\t'}`;
    });

    info.push({
        name: 'Cores',
        value: `<span style="white-space: pre">${cores}</span>`
    });

    let caches = '';

    save.MachineInformation.Cpu.Caches.forEach(function (cache) {
        caches += `${cache.Level}\t${cache.CapacityHRF}\t${cache.Associativity}-way\t${cache.TimesPresent}-times\t${cache.Type}\n`;
    });

    info.push({
        name: 'Caches',
        value: `<span style="white-space: pre">${caches}</span>`
    });

    let rams = '';

    save.MachineInformation.RAMSticks.forEach(function (ram, index) {
        rams += `${ram.Name ? ram.Name : index} ${ram.CapacityHRF} @ ${ram.Speed} Mhz by ${ram.Manfucturer}\n`;
    });

    info.push({
        name: 'RAM',
        value: `<span style="white-space: pre">${rams}</span>`
    });

    info.push(...renderFeatureFlags(save));

    return info;
}

export function render() {
    $('#sorting').parent().hide();
    $('#sorting').hide();
    $('#prev').parent().hide();

    const id: string = window.location.search.replace("?detail=", "");

    renderPromise = new Promise((resolve, reject) => {
        fetch(getSingleSaveUrl(id)).then(result => {
            if (!result.ok || result.status === 404) {
                error();
                return;
            }

            result.json().then(save => {
                score = calculateOverallScore(save);

                renderPointsComparisonGraph(save);
                renderSCComparisonGraph(save);
                renderACComparisonGraph(save);

                const results = renderResults(save);
                const info = renderInfo(save);

                const html: string = detailTemplate({
                    save: id,
                    name: save.MachineInformation.Cpu.Name,
                    score: isNaN(score) ? '0'.padStart(5, '0') : score.toString().padStart(5, '0'),
                    results_all: results.all,
                    results_categories: results.categories,
                    results_detailed: results.detailed,
                    infos: info
                });

                $('#accordion').html(html);
                $('.navbar').addClass(save.MachineInformation.Cpu.Vendor);
                resolve();
            });
        }).catch((err) => {
            console.error(err);
            error();
        });
    });
}
