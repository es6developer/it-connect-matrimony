import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../database/entities/user.entity';

export interface CompatibilityResult {
  score: number;
  breakdown: CompatibilityBreakdown;
}

export interface CompatibilityBreakdown {
  technologyStack: number;
  companyCulture: number;
  location: number;
  age: number;
  education: number;
  salary: number;
  religion: number;
  lifestyle: number;
  horoscope: number;
}

@Injectable()
export class CompatibilityService {
  private readonly logger = new Logger(CompatibilityService.name);

  private readonly weights = {
    technologyStack: 25,
    companyCulture: 10,
    location: 15,
    age: 10,
    education: 10,
    salary: 5,
    religion: 10,
    lifestyle: 10,
    horoscope: 5,
  };

  calculateScore(user1: User, user2: User): CompatibilityResult {
    const breakdown: CompatibilityBreakdown = {
      technologyStack: this.scoreTechnologyStack(user1, user2),
      companyCulture: this.scoreCompanyCulture(user1, user2),
      location: this.scoreLocation(user1, user2),
      age: this.scoreAge(user1, user2),
      education: this.scoreEducation(user1, user2),
      salary: this.scoreSalary(user1, user2),
      religion: this.scoreReligion(user1, user2),
      lifestyle: this.scoreLifestyle(user1, user2),
      horoscope: this.scoreHoroscope(user1, user2),
    };

    let total = 0;
    let maxPossible = 0;

    for (const [key, weight] of Object.entries(this.weights)) {
      total += breakdown[key] * weight;
      maxPossible += weight;
    }

    const score = maxPossible > 0 ? Math.round((total / maxPossible) * 100) : 0;

    return { score: Math.min(score, 100), breakdown };
  }

  private scoreTechnologyStack(user1: User, user2: User): number {
    const ts1 = user1.professionalDetail?.technologyStack as string[] | null;
    const ts2 = user2.professionalDetail?.technologyStack as string[] | null;

    if (!ts1 || !ts2 || ts1.length === 0 || ts2.length === 0) return 0;

    const set2 = new Set(ts2);
    const common = ts1.filter((t) => set2.has(t)).length;
    const union = new Set([...ts1, ...ts2]).size;

    return union > 0 ? common / union : 0;
  }

  private scoreCompanyCulture(user1: User, user2: User): number {
    let score = 0;

    if (
      user1.professionalDetail?.currentCompany &&
      user2.professionalDetail?.currentCompany &&
      user1.professionalDetail.currentCompany === user2.professionalDetail.currentCompany
    ) {
      score += 1;
    }

    if (
      user1.professionalDetail?.workMode &&
      user2.professionalDetail?.workMode &&
      user1.professionalDetail.workMode === user2.professionalDetail.workMode
    ) {
      score += 1;
    }

    if (
      user1.professionalDetail?.isStartupEmployee !== undefined &&
      user2.professionalDetail?.isStartupEmployee !== undefined &&
      user1.professionalDetail.isStartupEmployee === user2.professionalDetail.isStartupEmployee
    ) {
      score += 0.5;
    }

    if (
      user1.professionalDetail?.isEntrepreneur !== undefined &&
      user2.professionalDetail?.isEntrepreneur !== undefined &&
      user1.professionalDetail.isEntrepreneur === user2.professionalDetail.isEntrepreneur
    ) {
      score += 0.5;
    }

    return Math.min(score, 1);
  }

  private scoreLocation(user1: User, user2: User): number {
    const p1 = user1.profile;
    const p2 = user2.profile;

    if (!p1 || !p2) return 0;

    if (
      p1.country &&
      p2.country &&
      p1.country.toLowerCase() === p2.country.toLowerCase()
    ) {
      if (
        p1.state &&
        p2.state &&
        p1.state.toLowerCase() === p2.state.toLowerCase()
      ) {
        if (
          p1.city &&
          p2.city &&
          p1.city.toLowerCase() === p2.city.toLowerCase()
        ) {
          return 1;
        }
        return 0.8;
      }
      return 0.5;
    }

    if (p1.country && p2.country) return 0.2;

    return 0;
  }

  private scoreAge(user1: User, user2: User): number {
    const age1 = user1.profile?.age;
    const age2 = user2.profile?.age;

    if (!age1 || !age2) return 0;

    const diff = Math.abs(age1 - age2);

    if (diff <= 2) return 1;
    if (diff <= 5) return 0.7;
    if (diff <= 10) return 0.4;
    return 0.1;
  }

  private scoreEducation(user1: User, user2: User): number {
    const edu1 = user1.educationDetails;
    const edu2 = user2.educationDetails;

    if (!edu1 || !edu2 || edu1.length === 0 || edu2.length === 0) return 0;

    const highest1 = edu1.find((e) => e.isHighestDegree) || edu1[0];
    const highest2 = edu2.find((e) => e.isHighestDegree) || edu2[0];

    if (
      highest1.degree &&
      highest2.degree &&
      highest1.degree.toLowerCase() === highest2.degree.toLowerCase()
    ) {
      return 1;
    }

    if (
      highest1.university &&
      highest2.university &&
      highest1.university.toLowerCase() === highest2.university.toLowerCase()
    ) {
      return 0.7;
    }

    const degreeMap: Record<string, number> = {
      phd: 5,
      doctorate: 5,
      masters: 4,
      postgraduate: 4,
      bachelors: 3,
      undergraduate: 3,
      diploma: 2,
      'high school': 1,
    };

    const level1 = this.findEducationLevel(highest1.degree, degreeMap);
    const level2 = this.findEducationLevel(highest2.degree, degreeMap);

    if (level1 && level2) {
      const diff = Math.abs(level1 - level2);
      if (diff <= 1) return 0.8;
      if (diff <= 2) return 0.5;
    }

    return 0.3;
  }

  private findEducationLevel(
    degree: string | null,
    map: Record<string, number>,
  ): number | null {
    if (!degree) return null;
    const lower = degree.toLowerCase();
    for (const [key, value] of Object.entries(map)) {
      if (lower.includes(key)) return value;
    }
    return null;
  }

  private scoreSalary(user1: User, user2: User): number {
    const s1 = user1.professionalDetail?.currentSalary;
    const s2 = user2.professionalDetail?.currentSalary;

    if (!s1 || !s2) return 0;

    const ratio = Math.min(s1, s2) / Math.max(s1, s2);

    if (ratio >= 0.8) return 1;
    if (ratio >= 0.6) return 0.7;
    if (ratio >= 0.4) return 0.4;
    return 0.2;
  }

  private scoreReligion(user1: User, user2: User): number {
    let score = 0;
    const p1 = user1.profile;
    const p2 = user2.profile;

    if (!p1 || !p2) return 0;

    if (
      p1.religion &&
      p2.religion &&
      p1.religion.toLowerCase() === p2.religion.toLowerCase()
    ) {
      score += 0.5;
    }

    if (
      p1.community &&
      p2.community &&
      p1.community.toLowerCase() === p2.community.toLowerCase()
    ) {
      score += 0.3;
    }

    if (
      p1.motherTongue &&
      p2.motherTongue &&
      p1.motherTongue.toLowerCase() === p2.motherTongue.toLowerCase()
    ) {
      score += 0.2;
    }

    return Math.min(score, 1);
  }

  private scoreLifestyle(user1: User, user2: User): number {
    let score = 0;
    let factors = 0;

    const l1 = user1.lifestyleDetail;
    const l2 = user2.lifestyleDetail;

    if (!l1 || !l2) return 0;

    if (l1.diet && l2.diet) {
      if (l1.diet === l2.diet) score += 1;
      factors += 1;
    }

    if (l1.smoking && l2.smoking) {
      if (l1.smoking === l2.smoking) score += 1;
      factors += 1;
    }

    if (l1.drinking && l2.drinking) {
      if (l1.drinking === l2.drinking) score += 1;
      factors += 1;
    }

    if (factors === 0) return 0;
    return score / factors;
  }

  private scoreHoroscope(user1: User, user2: User): number {
    const h1 = user1.horoscopeDetail;
    const h2 = user2.horoscopeDetail;

    if (!h1 || !h2) return 0;

    let score = 0;
    let factors = 0;

    if (h1.manglik && h2.manglik) {
      if (h1.manglik === h2.manglik) score += 1;
      factors += 1;
    }

    if (h1.rashi && h2.rashi) {
      if (h1.rashi.toLowerCase() === h2.rashi.toLowerCase()) score += 1;
      factors += 1;
    }

    if (h1.nakshatra && h2.nakshatra) {
      if (h1.nakshatra.toLowerCase() === h2.nakshatra.toLowerCase()) score += 1;
      factors += 1;
    }

    if (factors === 0) return 0;
    return score / factors;
  }
}
