import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordHashAndImportedRepositories1727950000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;`
    );

    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS imported_repositories (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        url text NOT NULL,
        name text NOT NULL,
        status text DEFAULT 'imported',
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users DROP COLUMN IF EXISTS password_hash;`
    );
    await queryRunner.query(`DROP TABLE IF EXISTS imported_repositories;`);
  }
}
