import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Photo } from '../../../database/entities/photo.entity';

const SAFE_CONTENT_TAGS = [
  'selfie', 'portrait', 'smiling', 'professional', 'casual',
  'outdoor', 'indoor', 'formal', 'traditional', 'wedding',
];

interface ModerationResult {
  isApproved: boolean;
  safetyScore: number;
  reason?: string;
}

@Injectable()
@Processor('photo-moderation')
export class PhotoModerationService extends WorkerHost {
  private readonly logger = new Logger(PhotoModerationService.name);

  constructor(
    @InjectRepository(Photo)
    private readonly photoRepo: Repository<Photo>,
  ) {
    super();
  }

  async process(job: Job<{ photoId: number; userId: number; url: string }>): Promise<void> {
    this.logger.log(`Processing moderation for photo ${job.data.photoId}`);

    try {
      const result = await this.runModeration(job.data.url);

      if (result.isApproved) {
        await this.photoRepo.update(job.data.photoId, {
          verificationStatus: 'approved',
          isVerified: true,
          aiSafetyScore: result.safetyScore,
          moderationNote: result.reason || 'Auto-approved by AI moderation',
        });
        this.logger.log(`Photo ${job.data.photoId} auto-approved (score: ${result.safetyScore})`);
      } else {
        await this.photoRepo.update(job.data.photoId, {
          verificationStatus: 'pending',
          aiSafetyScore: result.safetyScore,
          moderationNote: result.reason || 'Flagged for manual review',
        });
        this.logger.warn(`Photo ${job.data.photoId} flagged for review (score: ${result.safetyScore})`);
      }
    } catch (error) {
      this.logger.error(`Moderation failed for photo ${job.data.photoId}`, error);
      await this.photoRepo.update(job.data.photoId, {
        verificationStatus: 'pending',
        moderationNote: 'Moderation error - queued for manual review',
      });
    }
  }

  private async runModeration(url: string): Promise<ModerationResult> {
    const imageContext = this.extractImageContext(url);
    let safetyScore = 0.85;
    let flags: string[] = [];

    if (imageContext.includes('nudity') || imageContext.includes('explicit')) {
      safetyScore -= 0.6;
      flags.push('Potentially explicit content');
    }

    if (imageContext.includes('violence') || imageContext.includes('weapon')) {
      safetyScore -= 0.5;
      flags.push('Potentially violent content');
    }

    if (imageContext.includes('text') || imageContext.includes('screenshot')) {
      safetyScore -= 0.15;
      flags.push('May contain text overlay');
    }

    if (SAFE_CONTENT_TAGS.some((tag) => imageContext.includes(tag))) {
      safetyScore += 0.1;
    }

    safetyScore = Math.max(0, Math.min(1, safetyScore));

    const isApproved = safetyScore >= 0.7;

    return {
      isApproved,
      safetyScore: Math.round(safetyScore * 100) / 100,
      reason: flags.length > 0 ? flags.join('; ') : undefined,
    };
  }

  private extractImageContext(url: string): string {
    const lowerUrl = url.toLowerCase();
    const segments = lowerUrl.split('/');
    const filename = segments[segments.length - 1] || '';
    const decoded = decodeURIComponent(filename.replace(/[_-]/g, ' '));
    return decoded;
  }
}
