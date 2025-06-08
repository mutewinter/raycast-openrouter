import { useFetch } from "@raycast/utils";
import { Cache } from "@raycast/api";
import { OpenRouterModel, OpenRouterModelsResponse } from "../types";

const DATA_STALE_TIME_IN_MILLISECONDS = 24 * 60 * 60 * 1000; // 24 hours
const cache = new Cache();

export function useModels() {
  const cached = cache.get("models");
  const lastFetchTime = Number(cache.get("lastFetchTime"));
  const isStale = !lastFetchTime || Date.now() - lastFetchTime > DATA_STALE_TIME_IN_MILLISECONDS;
  const { data, isLoading } = useFetch<OpenRouterModelsResponse>("https://openrouter.ai/api/v1/models", {
    execute: !cached || isStale,
  });

  const allModels = data?.data;

  const currentTime = Date.now();
  if (cached && !isStale) {
    return { data: JSON.parse(cached) as OpenRouterModel[], isLoading: false };
  }

  if (isLoading || !allModels) {
    return { data: undefined, isLoading };
  }

  cache.set("models", JSON.stringify(allModels));
  cache.set("lastFetchTime", JSON.stringify(currentTime));

  return { data: allModels, isLoading };
}
