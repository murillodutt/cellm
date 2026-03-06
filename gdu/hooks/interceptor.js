async function main() {
  try {
    let inputData = '';
    for await (const chunk of process.stdin) {
      inputData += chunk;
    }

    if (!inputData) return;

    const payload = JSON.parse(inputData);
    const prompt = payload.prompt || '';

    // Detect frontend intent: needs BOTH a subject keyword AND an action verb
    // Covers PT-BR and EN to handle bilingual users
    const hasSubject = /\b(?:interface|dashboard|tela|page|pagina|component|componente|layout|ui|frontend|visual|bot[aã]o|button|estilo|style|tailwind|vue|nuxt|form|formul[aá]rio|modal|sidebar|navbar|header|footer|card|table|tabela|menu|dialog|toast|dropdown)s?\b/i.test(prompt);
    const hasAction = /\b(?:cria|crie|fa[cç]|constr|desenh|mont|implement|ajust|refator|build|create|make|design|add|update|fix|refactor|style|implement)\b/i.test(prompt);

    if (hasSubject && hasAction) {
      console.log(`[GDU] Frontend intent detected. Engage the Goold Design UI (GDU) Framework before writing code. Process: 1. Contextual Anchoring (verify Tailwind config, DSE tokens, Nuxt structure). 2. Architectural Deconstruction (Atomic Design: atoms/molecules/organisms). 3. Propose a Markdown Spec to the user. 4. Implement only after approval. Consult Nuxt UI MCP Server (nuxt-ui-remote) for component APIs.`);
    }
  } catch (error) {
    // Fail silently so we don't break the CLI
  }
}

main();
