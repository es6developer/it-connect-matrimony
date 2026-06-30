import {
  DataSource, EntitySubscriberInterface, EventSubscriber,
  UpdateEvent,
} from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../../database/entities/user.entity';
import { Profile } from '../../../database/entities/profile.entity';

@Injectable()
@EventSubscriber()
export class ProfileSubscriber implements EntitySubscriberInterface<Profile> {
  constructor(
    @Inject(DataSource)
    private readonly dataSource: DataSource,
  ) {}

  listenTo() {
    return Profile;
  }

  async afterUpdate(event: UpdateEvent<Profile>): Promise<void> {
    if (event.entity) {
      const profile = event.entity as Profile;
      await this.recalculateCompletion(profile.userId);
    }
  }

  async afterInsert(event: UpdateEvent<Profile>): Promise<void> {
    if (event.entity) {
      const profile = event.entity as Profile;
      await this.recalculateCompletion(profile.userId);
    }
  }

  private async recalculateCompletion(userId: number): Promise<void> {
    const userRepo = this.dataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: userId },
      relations: [
        'profile',
        'professionalDetail',
        'educationDetails',
        'familyDetail',
        'lifestyleDetail',
        'languages',
        'horoscopeDetail',
        'partnerPreference',
        'photos',
      ],
    });

    if (!user) return;

    let score = 0;
    const total = 10;

    if (user.profile) {
      const p = user.profile;
      const basicFields = [
        p.headline, p.aboutMe, p.dateOfBirth, p.gender,
        p.maritalStatus, p.religion, p.motherTongue, p.height,
        p.country, p.state, p.city,
      ];
      if (basicFields.some((f) => f !== null && f !== undefined)) score += 1;
      if (p.aboutMe && p.aboutMe.length >= 50) score += 1;
    }

    if (user.professionalDetail) {
      const pd = user.professionalDetail;
      if (pd.designation || pd.currentCompany) score += 1;
    }

    if (user.educationDetails && user.educationDetails.length > 0) {
      score += 1;
    }

    if (user.familyDetail) {
      const fd = user.familyDetail;
      if (fd.fatherName || fd.motherName || fd.familyType) score += 1;
    }

    if (user.lifestyleDetail) {
      const ld = user.lifestyleDetail;
      if (ld.diet || ld.hobbies || ld.interests) score += 1;
    }

    if (user.languages && user.languages.length > 0) {
      score += 1;
    }

    if (user.horoscopeDetail) {
      const hd = user.horoscopeDetail;
      if (hd.rashi || hd.nakshatra || hd.manglik) score += 1;
    }

    if (user.partnerPreference) {
      score += 1;
    }

    if (user.photos && user.photos.length > 0) {
      score += 1;
    }

    const percentage = Math.round((score / total) * 100);
    await userRepo.update({ id: userId }, { profileCompletionPercentage: percentage });
  }
}
