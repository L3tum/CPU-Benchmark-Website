import $ from 'jquery';
import {getHighestFrequencyAggregationUrl, getHighestOverallScoreAggregationUrl, getPageFileUrl} from "./common/github";
import homeTemplate from './templates/home_template.msc';

const results: Array<any> = [];

let current_page: number = 1;

function getHighestFrequencies(): Promise<Array<{ frequency: number, name: string, vendor: string, filename: string }>> {
    return new Promise((resolve, reject) => {
        fetch(getHighestFrequencyAggregationUrl()).then(highestFrequenciesJSON => {
            if (!highestFrequenciesJSON.ok) {
                resolve([]);

                return;
            }

            highestFrequenciesJSON.json().then(highestFrequencies => {
                const entries: Array<{ Value: string, SaveFile: string }> = highestFrequencies.Entries.length > 5 ? highestFrequencies.Entries.slice(0, 5) : highestFrequencies.Entries;
                const list = [];

                for (const entry of entries) {
                    const parts = entry.Value.split(' === ');

                    list.push({
                        frequency: (parseInt(parts[2]) / 1000).toFixed(2),
                        name: parts[0],
                        vendor: parts[1],
                        filename: '?detail=' + entry.SaveFile
                    });
                }

                list.sort(function (a, b) {
                    if (a.frequency > b.frequency) {
                        return -1;
                    }

                    if (a.frequency < b.frequency) {
                        return 1;
                    }

                    return 0;
                });

                resolve(list);
            });
        });
    });
}

function getHighestScores(): Promise<Array<{ score: number, name: string, vendor: string, filename: string }>> {
    return new Promise((resolve, reject) => {
        fetch(getHighestOverallScoreAggregationUrl()).then((highestScoresJSON: Response) => {
            if (!highestScoresJSON.ok) {
                resolve([]);

                return;
            }

            highestScoresJSON.json().then(highestScores => {
                const entries: Array<{ Value: string, SaveFile: string }> = highestScores.Entries.length > 5 ? highestScores.Entries.slice(0, 5) : highestScores.Entries;
                const list = [];

                for (const entry of entries) {
                    const parts = entry.Value.split(' === ');

                    list.push({
                        score: parseInt(parts[2]),
                        name: parts[0],
                        vendor: parts[1],
                        filename: '?detail=' + entry.SaveFile
                    });
                }

                list.sort(function (a, b) {
                    if (a.score > b.score) {
                        return -1;
                    }

                    if (a.score < b.score) {
                        return 1;
                    }

                    return 0;
                });

                resolve(list);
            });
        });
    });
}

function renderCpuList(cpus: Array<{ Value: string, SaveFile: string }>): Array<{ name: string, vendor: string, score: string, filename: string }> {
    const cpuList = [];

    cpus.forEach(function (item: { Value: string, SaveFile: string }) {
        const item_parts = item.Value.split(" === ");

        cpuList.push({
            name: item_parts[0],
            vendor: item_parts[1],
            score: item_parts[2],
            filename: '?detail=' + item.SaveFile
        });
    });

    return cpuList;
}

function getResultsCurrentPage(page: number = current_page - 1): Promise<Array<{ Value: string, SaveFile: string }>> {
    return new Promise((resolve, reject) => {
        if (results.length > page * 10) {
            resolve(results.slice(page * 10, page * 10 + 10));
        } else {
            fetch(getPageFileUrl(page + 1)).then(result => {
                if (result.ok && result.status !== 404) {
                    result.json().then(json => {
                        results.push(...json.Entries);

                        if (results.length > page * 10) {
                            resolve(results.slice(page * 10, page * 10 + 10));
                        } else {
                            resolve([]);
                        }
                    });
                } else {
                    resolve([]);
                }
            });
        }
    });
}

function render() {
    const prev = $('#prev');
    const next = $('#next');
    const current = $('#current');

    prev.off('click');
    prev.prop('disabled', true);
    next.off('click');
    next.prop('disabled', true);
    current.html(current_page);

    getResultsCurrentPage().then(results => {
        const cpuList = renderCpuList(results);

        getHighestFrequencies().then(highestFrequencies => {

            getHighestScores().then(highestScores => {
                $('#accordion').html(homeTemplate({
                    cpus: cpuList,
                    highestFrequencies: highestFrequencies,
                    highestScores: highestScores
                }));
                $('.collapse').collapse();
                current.html(current_page);

                // Check previous page
                getResultsCurrentPage(current_page - 2).then(results => {
                    if (results.length === 0) {
                        prev.prop('disabled', true);
                        prev.off('click');
                    } else {
                        prev.prop('disabled', false);
                        prev.on('click', () => {
                            current_page--;
                            render();
                        });
                    }
                });

                // Check next page
                getResultsCurrentPage(current_page).then(results => {
                    if (results.length === 0) {
                        next.prop('disabled', true);
                        next.off('click');
                    } else {
                        next.prop('disabled', false);
                        next.on('click', () => {
                            current_page++;
                            render();
                        });
                    }
                });

                // // Register detail buttons
                // $('.detail-button').on('click', function () {
                //     window.location.href = '/detail/' + $(this).data('filename');
                // });
            });
        });
    });
}

export {render};
