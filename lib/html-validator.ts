export interface ValidationResult {
  isValid: boolean;
  fixedHtml?: string;
  error?: string;
}

export function validateAndFixHtml(html: string): ValidationResult {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      return {
        isValid: false,
        error: 'HTML parsing error: Invalid structure',
      };
    }

    if (!doc.querySelector('html')) {
      return {
        isValid: false,
        error: 'Missing <html> tag',
      };
    }

    if (!doc.querySelector('head')) {
      return {
        isValid: false,
        error: 'Missing <head> tag',
      };
    }

    if (!doc.querySelector('body')) {
      return {
        isValid: false,
        error: 'Missing <body> tag',
      };
    }

    const serializer = new XMLSerializer();
    const fixedHtml = serializer.serializeToString(doc);

    return {
      isValid: true,
      fixedHtml,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
    };
  }
}