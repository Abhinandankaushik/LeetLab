-- AlterTable
ALTER TABLE "Contest" ADD COLUMN     "ratingCeil" INTEGER,
ADD COLUMN     "ratingFloor" INTEGER,
ALTER COLUMN "type" SET DEFAULT 'individual';

-- AlterTable
ALTER TABLE "ContestProblem" ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 100;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "rating" INTEGER NOT NULL DEFAULT 1200,
ADD COLUMN     "reputation" INTEGER NOT NULL DEFAULT 0;
