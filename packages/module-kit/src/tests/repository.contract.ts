import { Repository } from "../contracts/repository.js";

export interface RepositoryTestFixture<T, TCreateInput, TUpdateInput, TQuery> {
  name: string;
  createRepository: () => Promise<Repository<T, TCreateInput, TUpdateInput, TQuery>>;
  createSampleInput: () => TCreateInput;
  createUpdatedInput: () => TUpdateInput;
  cleanup?: () => Promise<void>;
  assertMatches?: (entity: T, input: TCreateInput | TUpdateInput) => void;
}

/**
 * Reusable repository contract test runner.
 * Takes any test runner callback (e.g. Vitest describe/it or standalone async test).
 */
export function describeRepositoryContract<T extends { id: string }, TCreateInput, TUpdateInput, TQuery>(
  fixture: RepositoryTestFixture<T, TCreateInput, TUpdateInput, TQuery>,
  testRunner: {
    describe: (name: string, fn: () => void) => void;
    it: (name: string, fn: () => Promise<void>) => void;
    expect: any;
  }
) {
  const { describe, it, expect } = testRunner;

  describe(`Repository Contract: ${fixture.name}`, () => {
    it("creates an entity with a string ID and finds it by ID", async () => {
      const repo = await fixture.createRepository();
      const input = fixture.createSampleInput();
      const created = await repo.create(input);

      expect(created).toBeDefined();
      expect(typeof created.id).toBe("string");
      expect(created.id.length).toBeGreaterThan(0);

      if (fixture.assertMatches) {
        fixture.assertMatches(created, input);
      }

      const found = await repo.findById(created.id);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
    });

    it("returns null when searching for a non-existent ID", async () => {
      const repo = await fixture.createRepository();
      const found = await repo.findById("non-existent-id-00000000");
      expect(found).toBeNull();
    });

    it("updates an existing entity", async () => {
      const repo = await fixture.createRepository();
      const input = fixture.createSampleInput();
      const created = await repo.create(input);

      const updateInput = fixture.createUpdatedInput();
      const updated = await repo.update(created.id, updateInput);

      expect(updated).not.toBeNull();
      expect(updated?.id).toBe(created.id);
      if (fixture.assertMatches) {
        fixture.assertMatches(updated!, updateInput);
      }
    });

    it("returns null when updating a non-existent entity", async () => {
      const repo = await fixture.createRepository();
      const updateInput = fixture.createUpdatedInput();
      const updated = await repo.update("non-existent-id-00000000", updateInput);
      expect(updated).toBeNull();
    });

    it("deletes an existing entity", async () => {
      const repo = await fixture.createRepository();
      const input = fixture.createSampleInput();
      const created = await repo.create(input);

      const deleted = await repo.delete(created.id);
      expect(deleted).toBe(true);

      const found = await repo.findById(created.id);
      expect(found).toBeNull();
    });

    it("returns paginated results with correct metadata", async () => {
      const repo = await fixture.createRepository();
      const paginated = await repo.findMany({ page: 1, limit: 10 } as unknown as TQuery);

      expect(paginated).toBeDefined();
      expect(Array.isArray(paginated.items)).toBe(true);
      expect(typeof paginated.page).toBe("number");
      expect(typeof paginated.limit).toBe("number");
      expect(typeof paginated.total).toBe("number");
      expect(typeof paginated.totalPages).toBe("number");
    });
  });
}

