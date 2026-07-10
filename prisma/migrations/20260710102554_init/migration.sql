-- CreateTable
CREATE TABLE "events" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "datum" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'geplant',
    "gaesteanzahlGeplant" INTEGER NOT NULL,
    "gaesteanzahlAktuell" INTEGER NOT NULL,
    "budgetGesamt" DECIMAL NOT NULL,
    "notizen" TEXT,
    "erstelltAm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "budgetPruefbeduerftig" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "gaeste" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "telefon" TEXT,
    "typ" TEXT NOT NULL DEFAULT 'standard',
    "anmeldestatus" TEXT NOT NULL DEFAULT 'angemeldet',
    "ernaehrung" TEXT,
    "allergien" TEXT,
    "tischzuweisung" TEXT,
    "vipAnforderungen" TEXT,
    CONSTRAINT "gaeste_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dienstleister" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "kategorie" TEXT NOT NULL,
    "ansprechpartner" TEXT,
    "telefonMobil" TEXT,
    "email" TEXT,
    "zuverlaessigkeitsNotiz" TEXT,
    "backupFuerId" INTEGER,
    CONSTRAINT "dienstleister_backupFuerId_fkey" FOREIGN KEY ("backupFuerId") REFERENCES "dienstleister" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ablaufplaene" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "istAktuell" BOOLEAN NOT NULL DEFAULT false,
    "erstelltAm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ablaufplaene_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ablaufpunkte" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ablaufplanId" INTEGER NOT NULL,
    "uhrzeitStart" DATETIME NOT NULL,
    "uhrzeitEnde" DATETIME,
    "bezeichnung" TEXT NOT NULL,
    "verantwortlich" TEXT,
    "istPuffer" BOOLEAN NOT NULL DEFAULT false,
    "sichtbarFuerDienstleister" BOOLEAN NOT NULL DEFAULT false,
    "eskaliert" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ablaufpunkte_ablaufplanId_fkey" FOREIGN KEY ("ablaufplanId") REFERENCES "ablaufplaene" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "aufgaben" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventId" INTEGER NOT NULL,
    "bezeichnung" TEXT NOT NULL,
    "faelligAm" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'offen',
    "abhaengigVonId" INTEGER,
    "zugewiesenAn" TEXT,
    "erinnerungAm" DATETIME,
    "pruefbeduerftig" BOOLEAN NOT NULL DEFAULT false,
    "eskaliert" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "aufgaben_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "aufgaben_abhaengigVonId_fkey" FOREIGN KEY ("abhaengigVonId") REFERENCES "aufgaben" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "kommunikationen" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventId" INTEGER NOT NULL,
    "kanal" TEXT NOT NULL,
    "datum" DATETIME NOT NULL,
    "inhalt" TEXT NOT NULL,
    "istVerbindlich" BOOLEAN NOT NULL DEFAULT false,
    "beteiligte" TEXT,
    "erstelltVon" TEXT,
    CONSTRAINT "kommunikationen_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "budget_positionen" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventId" INTEGER NOT NULL,
    "bezeichnung" TEXT NOT NULL,
    "betragAngebot" DECIMAL,
    "betragBestaetigt" DECIMAL,
    "betragBezahlt" DECIMAL,
    "dienstleisterId" INTEGER,
    "pruefbeduerftig" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "budget_positionen_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "budget_positionen_dienstleisterId_fkey" FOREIGN KEY ("dienstleisterId") REFERENCES "dienstleister" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_dienstleister" (
    "eventId" INTEGER NOT NULL,
    "dienstleisterId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "vertragsUrl" TEXT,
    "stornofrist" DATETIME,
    "kritisch" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("eventId", "dienstleisterId"),
    CONSTRAINT "event_dienstleister_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "event_dienstleister_dienstleisterId_fkey" FOREIGN KEY ("dienstleisterId") REFERENCES "dienstleister" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ablaufplaene_eventId_version_key" ON "ablaufplaene"("eventId", "version");
