-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyName" TEXT NOT NULL DEFAULT 'My Company',
    "logoUrl" TEXT,
    "slogan" TEXT,
    "themeMode" TEXT NOT NULL DEFAULT 'dark',
    "backgroundUrl" TEXT,
    "isSetup" BOOLEAN NOT NULL DEFAULT false
);
