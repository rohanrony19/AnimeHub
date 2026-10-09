package com.animehub.service.metadata;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AnimeMetadataService {

    private final Map<String, AnimeMetadataProvider> providers;
    private final String primaryProvider;

    public AnimeMetadataService(
            List<AnimeMetadataProvider> providerList,
            @Value("${anime.metadata.primary-provider:JIKAN}")
            String primaryProvider) {

        this.providers = new LinkedHashMap<>();

        for (AnimeMetadataProvider provider : providerList) {
            this.providers.put(
                    provider.getProviderName().toUpperCase(),
                    provider
            );
        }

        this.primaryProvider = primaryProvider.toUpperCase();
    }

    public List<AnimeMetadata> search(String query) {

        for (AnimeMetadataProvider provider : getOrderedProviders()) {
            try {
                List<AnimeMetadata> results = provider.search(query);

                if (results != null && !results.isEmpty()) {
                    return results;
                }
            } catch (Exception ignored) {
                // Try the next provider.
            }
        }

        return List.of();
    }

    public AnimeMetadata getById(String externalId) {

        for (AnimeMetadataProvider provider : getOrderedProviders()) {
            try {
                AnimeMetadata result = provider.getById(externalId);

                if (result != null) {
                    return result;
                }
            } catch (Exception ignored) {
                // Try the next provider.
            }
        }

        throw new IllegalStateException(
                "Anime metadata is currently unavailable."
        );
    }

    private List<AnimeMetadataProvider> getOrderedProviders() {

        List<AnimeMetadataProvider> ordered = new ArrayList<>();

        AnimeMetadataProvider primary =
                providers.get(primaryProvider);

        if (primary != null) {
            ordered.add(primary);
        }

        for (AnimeMetadataProvider provider : providers.values()) {
            if (provider != primary) {
                ordered.add(provider);
            }
        }

        return ordered;
    }
    
    public AnimeMetadata getByProvider(String providerName, String externalId) {

        if (providerName == null || providerName.isBlank()) {
            throw new IllegalArgumentException("Provider is required.");
        }

        if (externalId == null || externalId.isBlank()) {
            throw new IllegalArgumentException("External ID is required.");
        }

        AnimeMetadataProvider provider =
                providers.get(providerName.toUpperCase());

        if (provider == null) {
            throw new IllegalArgumentException(
                    "Unsupported metadata provider: " + providerName
            );
        }

        try {
            AnimeMetadata result = provider.getById(externalId);

            if (result == null) {
                throw new IllegalStateException(
                        "Anime metadata not found."
                );
            }

            return result;

        } catch (Exception e) {
            throw new IllegalStateException(
                    "Unable to fetch anime metadata from provider: "
                            + providerName,
                    e
            );
        }
    }
}