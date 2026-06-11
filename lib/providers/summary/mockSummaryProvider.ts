import { generateMockSummary } from "@/lib/mockSummary";
import type { GeneratedSummary, SummaryProvider, SummaryProviderInput } from "@/lib/providers/summary/types";

export class MockSummaryProvider implements SummaryProvider {
  name = "mock" as const;

  async generate(input: SummaryProviderInput): Promise<GeneratedSummary> {
    return {
      provider: this.name,
      content: generateMockSummary(input.keyword, input.infoItems)
    };
  }
}
