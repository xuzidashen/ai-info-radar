import { generateMockSummary } from "@/lib/mockSummary";
import type { GeneratedSummary, SummaryProvider, SummaryProviderInput } from "@/lib/providers/summary/types";
import { parseStructuredSummary, serializeStructuredSummary } from "@/lib/utils/summaryParser";

export class MockSummaryProvider implements SummaryProvider {
  name = "mock" as const;

  async generate(input: SummaryProviderInput): Promise<GeneratedSummary> {
    return {
      provider: this.name,
      content: serializeStructuredSummary(parseStructuredSummary(generateMockSummary(input.keyword, input.infoItems)))
    };
  }
}
