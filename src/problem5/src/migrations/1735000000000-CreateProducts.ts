import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProducts1735000000000 implements MigrationInterface {
  name = 'CreateProducts1735000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(200) NOT NULL,
        "description" VARCHAR(2000),
        "category" VARCHAR(100) NOT NULL,
        "price" NUMERIC(12,2) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_products_category" ON "products" ("category");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_name" ON "products" ("name");`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "products";`);
  }
}
