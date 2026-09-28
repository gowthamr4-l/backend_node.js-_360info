-- CreateTable
CREATE TABLE "ResidentialResaleProperty" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "propertyCategory" TEXT NOT NULL DEFAULT 'Residential',
    "adType" TEXT NOT NULL DEFAULT 'Resale',
    "propertyType" TEXT NOT NULL,
    "bhkType" TEXT NOT NULL,
    "totalFloor" TEXT,
    "propertyAge" TEXT,
    "facing" TEXT,
    "builtUpArea" TEXT,
    "city" TEXT,
    "locality" TEXT,
    "landmark" TEXT,
    "expectedPrice" TEXT,
    "priceNegotiable" BOOLEAN NOT NULL DEFAULT false,
    "currentlyUnderLoan" BOOLEAN NOT NULL DEFAULT false,
    "furnishing" TEXT,
    "parking" TEXT,
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

    CONSTRAINT "ResidentialResaleProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResidentialResalePhoto" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResidentialResalePhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResidentialPgProperty" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "propertyCategory" TEXT NOT NULL DEFAULT 'Residential',
    "adType" TEXT NOT NULL DEFAULT 'PG / Hostel',
    "pgRoomTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "city" TEXT,
    "locality" TEXT,
    "landmark" TEXT,
    "expectedRent" TEXT,
    "expectedDeposit" TEXT,
    "maintenanceExtra" BOOLEAN NOT NULL DEFAULT false,
    "availableFrom" TEXT,
    "preferredTenants" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredGuests" TEXT,
    "foodIncluded" TEXT,
    "pgRules" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "gateClosingTime" TEXT,
    "furnishing" TEXT,
    "parking" TEXT,
    "description" TEXT,
    "whoWillShow" TEXT,
    "secondaryNumber" TEXT,
    "availability" TEXT,
    "startTime" TEXT,
    "endTime" TEXT,
    "availableAllDay" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResidentialPgProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResidentialPgPhoto" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResidentialPgPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommercialRentProperty" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "propertyCategory" TEXT NOT NULL DEFAULT 'Commercial',
    "adType" TEXT NOT NULL DEFAULT 'Rent',
    "propertyType" TEXT NOT NULL,
    "buildingType" TEXT,
    "propertyAge" TEXT,
    "floor" TEXT,
    "totalFloor" TEXT,
    "superBuiltUpArea" TEXT,
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
    "leaseDuration" TEXT,
    "lockinPeriod" TEXT,
    "furnishing" TEXT,
    "bathrooms" INTEGER NOT NULL DEFAULT 0,
    "waterSupply" TEXT,
    "gatedSecurity" TEXT,
    "otherFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT,
    "whoWillShow" TEXT,
    "secondaryNumber" TEXT,
    "availability" TEXT,
    "startTime" TEXT,
    "endTime" TEXT,
    "availableAllDay" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommercialRentProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommercialRentPhoto" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommercialRentPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommercialSaleProperty" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "propertyCategory" TEXT NOT NULL DEFAULT 'Commercial',
    "adType" TEXT NOT NULL DEFAULT 'Sale',
    "propertyType" TEXT NOT NULL,
    "buildingType" TEXT,
    "propertyAge" TEXT,
    "floor" TEXT,
    "totalFloor" TEXT,
    "superBuiltUpArea" TEXT,
    "carpetArea" TEXT,
    "city" TEXT,
    "locality" TEXT,
    "landmark" TEXT,
    "expectedPrice" TEXT,
    "priceNegotiable" BOOLEAN NOT NULL DEFAULT false,
    "currentlyUnderLoan" BOOLEAN NOT NULL DEFAULT false,
    "furnishing" TEXT,
    "bathrooms" INTEGER NOT NULL DEFAULT 0,
    "waterSupply" TEXT,
    "gatedSecurity" TEXT,
    "otherFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[],
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

    CONSTRAINT "CommercialSaleProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommercialSalePhoto" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommercialSalePhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandPlotResaleProperty" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "propertyCategory" TEXT NOT NULL DEFAULT 'Land / Plot',
    "adType" TEXT NOT NULL DEFAULT 'Resale',
    "plotArea" TEXT,
    "plotLength" TEXT,
    "plotWidth" TEXT,
    "boundaryWall" TEXT,
    "floorsAllowed" TEXT,
    "cornerPlot" TEXT,
    "gatedProject" TEXT,
    "city" TEXT,
    "locality" TEXT,
    "landmark" TEXT,
    "expectedPrice" TEXT,
    "priceNegotiable" BOOLEAN NOT NULL DEFAULT false,
    "currentlyUnderLoan" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "whoWillShow" TEXT,
    "secondaryNumber" TEXT,
    "availability" TEXT,
    "startTime" TEXT,
    "endTime" TEXT,
    "availableAllDay" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandPlotResaleProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandPlotResalePhoto" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LandPlotResalePhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResidentialResaleProperty_userId_idx" ON "ResidentialResaleProperty"("userId");

-- CreateIndex
CREATE INDEX "ResidentialResalePhoto_propertyId_idx" ON "ResidentialResalePhoto"("propertyId");

-- CreateIndex
CREATE INDEX "ResidentialPgProperty_userId_idx" ON "ResidentialPgProperty"("userId");

-- CreateIndex
CREATE INDEX "ResidentialPgPhoto_propertyId_idx" ON "ResidentialPgPhoto"("propertyId");

-- CreateIndex
CREATE INDEX "CommercialRentProperty_userId_idx" ON "CommercialRentProperty"("userId");

-- CreateIndex
CREATE INDEX "CommercialRentPhoto_propertyId_idx" ON "CommercialRentPhoto"("propertyId");

-- CreateIndex
CREATE INDEX "CommercialSaleProperty_userId_idx" ON "CommercialSaleProperty"("userId");

-- CreateIndex
CREATE INDEX "CommercialSalePhoto_propertyId_idx" ON "CommercialSalePhoto"("propertyId");

-- CreateIndex
CREATE INDEX "LandPlotResaleProperty_userId_idx" ON "LandPlotResaleProperty"("userId");

-- CreateIndex
CREATE INDEX "LandPlotResalePhoto_propertyId_idx" ON "LandPlotResalePhoto"("propertyId");

-- AddForeignKey
ALTER TABLE "ResidentialResaleProperty" ADD CONSTRAINT "ResidentialResaleProperty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResidentialResalePhoto" ADD CONSTRAINT "ResidentialResalePhoto_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "ResidentialResaleProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResidentialPgProperty" ADD CONSTRAINT "ResidentialPgProperty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResidentialPgPhoto" ADD CONSTRAINT "ResidentialPgPhoto_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "ResidentialPgProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommercialRentProperty" ADD CONSTRAINT "CommercialRentProperty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommercialRentPhoto" ADD CONSTRAINT "CommercialRentPhoto_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "CommercialRentProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommercialSaleProperty" ADD CONSTRAINT "CommercialSaleProperty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommercialSalePhoto" ADD CONSTRAINT "CommercialSalePhoto_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "CommercialSaleProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandPlotResaleProperty" ADD CONSTRAINT "LandPlotResaleProperty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandPlotResalePhoto" ADD CONSTRAINT "LandPlotResalePhoto_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "LandPlotResaleProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;
