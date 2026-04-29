package com.buy01.media.exception;

public class ForbiddenAction extends RuntimeException {
    public ForbiddenAction(String message) {
        super(message);
    }
}
