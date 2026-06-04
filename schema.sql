-- Schema for RifaPay

CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    password TEXT NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT false,
    "verifyCode" TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    plan TEXT NOT NULL DEFAULT 'FREE',
    "mpAccountId" TEXT,
    "pushToken" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Rifa" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    "imageUrl" TEXT,
    "pricePerNumber" DECIMAL(12,2) NOT NULL,
    "totalNumbers" INTEGER NOT NULL,
    "startDate" TIMESTAMP NOT NULL DEFAULT now(),
    "drawDate" TIMESTAMP NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    "winnerNumber" INTEGER,
    "winnerName" TEXT,
    "commissionRate" DECIMAL(12,2) NOT NULL DEFAULT 0.03,
    "allowAffiliates" BOOLEAN NOT NULL DEFAULT false,
    colors JSONB,
    category TEXT,
    "aliasCbu" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "userId" TEXT NOT NULL REFERENCES "User"(id)
);

CREATE INDEX IF NOT EXISTS idx_rifa_slug ON "Rifa"(slug);
CREATE INDEX IF NOT EXISTS idx_rifa_userId ON "Rifa"("userId");
CREATE INDEX IF NOT EXISTS idx_rifa_status ON "Rifa"(status);

CREATE TABLE IF NOT EXISTS "Number" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    number INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'AVAILABLE',
    "buyerName" TEXT,
    "buyerPhone" TEXT,
    "buyerEmail" TEXT,
    "reservedAt" TIMESTAMP,
    "paidAt" TIMESTAMP,
    "rifaId" TEXT NOT NULL REFERENCES "Rifa"(id),
    "soldBy" TEXT,
    "transactionId" TEXT,
    UNIQUE("rifaId", number)
);

CREATE INDEX IF NOT EXISTS idx_number_rifa_status ON "Number"("rifaId", status);
CREATE INDEX IF NOT EXISTS idx_number_transaction ON "Number"("transactionId");

CREATE TABLE IF NOT EXISTS "Transaction" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "mpPreferenceId" TEXT UNIQUE,
    "mpPaymentId" TEXT UNIQUE,
    amount DECIMAL(12,2) NOT NULL,
    commission DECIMAL(12,2) NOT NULL,
    "netAmount" DECIMAL(12,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    "buyerName" TEXT NOT NULL,
    "buyerPhone" TEXT,
    "buyerEmail" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "rifaId" TEXT NOT NULL REFERENCES "Rifa"(id)
);

CREATE INDEX IF NOT EXISTS idx_transaction_mpPaymentId ON "Transaction"("mpPaymentId");
CREATE INDEX IF NOT EXISTS idx_transaction_rifaId ON "Transaction"("rifaId");

CREATE TABLE IF NOT EXISTS "Affiliate" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    phone TEXT,
    "commissionRate" DECIMAL(12,2) NOT NULL DEFAULT 0.10,
    "referralCode" TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "rifaId" TEXT NOT NULL REFERENCES "Rifa"(id),
    "userId" TEXT NOT NULL REFERENCES "User"(id)
);

CREATE TABLE IF NOT EXISTS "AffiliateEarning" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    amount DECIMAL(12,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "affiliateId" TEXT NOT NULL REFERENCES "Affiliate"(id),
    "transactionId" TEXT REFERENCES "Transaction"(id),
    "userId" TEXT NOT NULL REFERENCES "User"(id)
);
