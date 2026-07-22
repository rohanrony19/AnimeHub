package com.animehub.exception;

/**
 * Thrown for expected, client-facing business errors (bad credentials,
 * invalid OTP, duplicate email, etc.) where the message text is written
 * by us and is safe to return to the client verbatim — as opposed to
 * an unexpected system exception, whose message might contain internal
 * details and should never reach the client.
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}