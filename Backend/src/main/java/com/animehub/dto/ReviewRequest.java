package com.animehub.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record ReviewRequest(

        @Min(1)
        @Max(5)
        Integer rating,

        @NotBlank(message = "Comment cannot be empty")
        String comment

) {
}