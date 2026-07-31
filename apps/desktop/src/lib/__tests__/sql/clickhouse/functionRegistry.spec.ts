import { describe, expect, it } from "vitest";
import { createClickHouseFunctionRegistry } from "@/lib/sql/clickhouse/functionRegistry";
import type { ClickHouseFunctionDefinition } from "@/lib/sql/clickhouse/functionTypes";

const toStartOfDay: ClickHouseFunctionDefinition = {
  name: "toStartOfDay",
  kind: "regular",
  category: "date-time",
  signatures: [{ parameterGroups: [["value", "time_zone?"]], returnType: "DateTime" }],
  aliases: ["startOfDay"],
};

describe("ClickHouse function registry", () => {
  it("looks up canonical names case-insensitively and preserves overloads", () => {
    const registry = createClickHouseFunctionRegistry([toStartOfDay]);

    expect(registry.get("TOSTARTOFDAY")).toEqual(toStartOfDay);
    expect(registry.search("tostart", 20)).toEqual([toStartOfDay]);
    expect(registry.search("startof", 20)).toEqual([toStartOfDay]);
  });

  it("rejects duplicate canonical names case-insensitively", () => {
    expect(() => createClickHouseFunctionRegistry([toStartOfDay, { ...toStartOfDay, name: "TOSTARTOFDAY" }])).toThrow(/duplicate/i);
  });

  it("rejects an invalid preferred signature index", () => {
    expect(() => createClickHouseFunctionRegistry([{ ...toStartOfDay, preferredSignature: 2 }])).toThrow(/preferred signature/i);
  });
});
