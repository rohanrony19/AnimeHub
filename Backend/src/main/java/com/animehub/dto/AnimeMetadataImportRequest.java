package com.animehub.dto;

import jakarta.validation.constraints.NotBlank;

public record AnimeMetadataImportRequest(
        @NotBlank(message = "Provider is required")
        String provider,

        @NotBlank(message = "External ID is required")
        String externalId
) {
}