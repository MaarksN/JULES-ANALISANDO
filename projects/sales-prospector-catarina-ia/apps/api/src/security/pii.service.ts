export class PiiRedactionService {
  redact(text: string): string {
    // CPF Regex (Simple)
    const cpfRegex = /\d{3}\.\d{3}\.\d{3}-\d{2}/g;
    // Credit Card Regex (Simple)
    const ccRegex = /\b(?:\d[ -]*?){13,16}\b/g;

    return text
      .replace(cpfRegex, "[CPF REMOVIDO]")
      .replace(ccRegex, "[CARTÃO REMOVIDO]");
  }
}
