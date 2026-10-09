package com.animehub.service.metadata;

import java.util.List;

public interface AnimeMetadataProvider {

    String getProviderName();

    List<AnimeMetadata> search(String query);

    AnimeMetadata getById(String externalId);
}