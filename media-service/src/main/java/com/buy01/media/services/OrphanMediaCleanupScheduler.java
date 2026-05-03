package com.buy01.media.services;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class OrphanMediaCleanupScheduler {

    private final MediaService mediaService;

    public OrphanMediaCleanupScheduler(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @Scheduled(fixedRateString = "${media.orphan-cleanup.fixed-rate-ms:60000}")
    public void deleteOldOrphanMedia() {
        int deletedCount = mediaService.deleteOldOrphanMedia();
        if (deletedCount > 0) {
            System.out.println("Deleted orphan media count: " + deletedCount);
        }
    }
}
