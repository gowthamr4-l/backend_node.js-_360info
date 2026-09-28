-- CreateTable
CREATE TABLE "ResidentialRentProperty" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "propertyCategory" TEXT NOT NULL DEFAULT 'Residential',
    "adType" TEXT NOT NULL DEFAULT 'Rent',
    "propertyType" TEXT NOT NULL,
    "bhkType" TEXT NOT NULL,
    "totalFloor" TEXT,
    "propertyAge" TEXT,
    "facing" TEXT,
    "builtUpArea" TEXT,
    "city" TEXT,
    "locality" TEXT,
    "landmark" TEXT,
    "expectedRent" TEXT,
    "expectedDeposit" TEXT,
    "rentNegotiable" BOOLEAN NOT NULL DEFAULT false,
    "depositNegotiable" BOOLEAN NOT NULL DEFAULT false,
    "monthlyMaintenance" TEXT,
    "maintenanceExtra" BOOLEAN NOT NULL DEFAULT false,
    "availableFrom" TEXT,
    "preferredTenants" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "furnishing" TEXT,
    "parking" TEXT,
    "leaseDuration" TEXT,
    "lockinPeriod" TEXT,
    "bathrooms" INTEGER NOT NULL DEFAULT 0,
    "balcony" INTEGER NOT NULL DEFAULT 0,
    "waterSupply" TEXT,
    "gym" TEXT,
    "petAllowed" TEXT,
    "nonVegAllowed" TEXT,
    "gatedSecurity" TEXT,
    "description" TEXT,
    "propertyCondition" TEXT,
    "whoWillShow" TEXT,
    "secondaryNumber" TEXT,
    "availability" TEXT,
    "startTime" TEXT,
    "endTime" TEXT,
    "availableAllDay" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResidentialRentProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyPhoto" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResidentialRentProperty_userId_idx" ON "ResidentialRentProperty"("userId");

-- CreateIndex
CREATE INDEX "PropertyPhoto_propertyId_idx" ON "PropertyPhoto"("propertyId");

-- AddForeignKey
ALTER TABLE "ResidentialRentProperty" ADD CONSTRAINT "ResidentialRentProperty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyPhoto" ADD CONSTRAINT "PropertyPhoto_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "ResidentialRentProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;
