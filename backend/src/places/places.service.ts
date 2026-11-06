import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';


@Injectable()
export class PlacesService {

  constructor(private prisma: PrismaService) {}

  async findAll(category?: string) {
  
    const places = await this.prisma.place.findMany({
      where: category ? { category } : {},
      include: {
        reviews: true,
      },
    });

   
    const allReviews = await this.prisma.review.findMany({});
    const globalTotalStars = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0);
    const globalReviewCount = allReviews.length;
    
    // Global average rating across the whole city
    const C = globalReviewCount > 0 ? globalTotalStars / globalReviewCount : 3.0;

    // m = Minimum review threshold. Places with fewer than 2 reviews get pulled heavily toward the city average
    const m = 2; 

    //  Bayesian ranking formula
    const rankedPlaces = places.map((place: any) => {

      const v = place.reviews.length; // Number of reviews for specific place
      const totalStars = place.reviews.reduce((sum: number, r: any) => sum + r.rating, 0);
      const R = v > 0 ? totalStars / v : C; // Raw average rating for specific place

      // The Bayesian formula
      const weightedScore = 
               (v / (v + m)) * R + (m / (v + m)) * C;

      return {
        id: place.id,
        name: place.name,
        category: place.category,
        description: place.description,
        openingHours: place.openingHours,
        reviewCount: v,
        rawAverageRating: Number(R.toFixed(1)),
        weightedScore: Number(weightedScore.toFixed(2)),
      };
    });

    // 4. Sort by the weighted score in descending order 
    return rankedPlaces.sort((a :any, b :any) => b.weightedScore - a.weightedScore);
  }

  async findOne(id: number) {
    return this.prisma.place.findUnique({
      where: { id },
      include: {
        reviews: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
        },
        tourSlots: {
          include: { bookings: true },
        },
      },
    });
  }
}
