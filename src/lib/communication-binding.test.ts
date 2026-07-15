import { describe, expect, it } from "vitest";
import {
  filterBindingCommunications,
  isBindingCommunication,
} from "./communication-binding";

describe("verbindliche Kommunikation", () => {
  it("wertet nur explizit verbindliche Kommunikation als Grundlage", () => {
    expect(isBindingCommunication({ istVerbindlich: true })).toBe(true);
    expect(isBindingCommunication({ istVerbindlich: false })).toBe(false);
  });

  it("filtert unverbindliche Notizen aus Grundlagen heraus", () => {
    const communications = [
      { id: 1, istVerbindlich: true },
      { id: 2, istVerbindlich: false },
      { id: 3, istVerbindlich: true },
    ];

    expect(filterBindingCommunications(communications).map((item) => item.id)).toEqual([
      1, 3,
    ]);
  });
});
