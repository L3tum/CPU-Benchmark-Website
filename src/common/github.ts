const BASE_URL = "https://raw.githubusercontent.com/";
const OWNER = "L3tum";
const REPO = "CPU-Benchmark-Database";
const BRANCH = "master";
const PATH = "saves";
const AGGREGATIONS_PATH = "aggregations";

export function getSingleSaveUrl(filename: string): string {
    return `${BASE_URL}${OWNER}/${REPO}/${BRANCH}/${PATH}/${filename}.json`;
}

export function getPageFileUrl(page: number): string {
    return `${BASE_URL}${OWNER}/${REPO}/${BRANCH}/${AGGREGATIONS_PATH}/pagination/${page}.json`;
}

export function getAverageAggregationUrl(): string {
    return `${BASE_URL}${OWNER}/${REPO}/${BRANCH}/${AGGREGATIONS_PATH}/byCPU/average.json`;
}

export function getSCAverageAggregationUrl(): string {
    return `${BASE_URL}${OWNER}/${REPO}/${BRANCH}/${AGGREGATIONS_PATH}/averageByCoreCount/1.json`;
}

export function getACAverageAggregationUrl(count: number): string {
    return `${BASE_URL}${OWNER}/${REPO}/${BRANCH}/${AGGREGATIONS_PATH}/averageByCoreCount/${count}.json`;
}

export function getHighestFrequencyAggregationUrl(): string {
    return `${BASE_URL}${OWNER}/${REPO}/${BRANCH}/${AGGREGATIONS_PATH}/byHighestFrequency/single-core.json`;
}

export function getHighestOverallScoreAggregationUrl(): string {
    return `${BASE_URL}${OWNER}/${REPO}/${BRANCH}/${AGGREGATIONS_PATH}/byHighestScore/overall-score.json`;
}
