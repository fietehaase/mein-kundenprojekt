import { describe, expect, it } from "vitest";
import { triggersProviderOutageEscalation } from "./provider-escalation";

describe("Dienstleister-Ausfalleskalation", () => {
  it("eskaliert nur kritische ausgefallene Dienstleister", () => {
    expect(
      triggersProviderOutageEscalation({
        status: "ausgefallen",
        kritisch: true,
      }),
    ).toBe(true);
  });

  it("ignoriert nicht-kritische oder nicht-ausgefallene Dienstleister", () => {
    expect(
      triggersProviderOutageEscalation({
        status: "ausgefallen",
        kritisch: false,
      }),
    ).toBe(false);
    expect(
      triggersProviderOutageEscalation({
        status: "bestaetigt",
        kritisch: true,
      }),
    ).toBe(false);
  });
});
