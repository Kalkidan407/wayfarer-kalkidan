import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

//  Reviewing again updates the old one-
  async createOrUpdateReview(placeId: number, userId: number, rating: number, body: string) {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be an integer between 1 and 5 stars');
    }

    return this.prisma.review.upsert({
      where: {
        placeId_userId: { placeId, userId },
      },
      update: {
        rating,
        body,
        createdAt: new Date(),
      },
      create: {
        placeId,
        userId,
        rating,
        body,
      },
    });
  }

 
  async findByPlace(placeId?: number) {
    return this.prisma.review.findMany({
      where: placeId ? { placeId } : {},
      include: {
        user: { select: { id: true, name: true } },
        place: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
