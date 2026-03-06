const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  try {
    // Read stdin
    let inputData = '';
    for await (const chunk of process.stdin) {
      inputData += chunk;
    }

    if (!inputData) return;

    const payload = JSON.parse(inputData);
    
    // UserPromptSubmit payload typically contains the prompt text
    const prompt = payload.prompt || '';
    
    // Evaluate if the prompt requires visual/architectural intervention
    // We look for intents of creation, styling, structuring UI, rather than just simple words
    const isFrontendIntent = /interface|dashboard|tela|component|layout|ui|frontend|visual|botão|estilo|tailwind|vue|nuxt/i.test(prompt) && 
                             /cria|faç|constr|desenh|mont|implement|ajust|refator/i.test(prompt);

    if (isFrontendIntent) {
      
      // Auto-Dependency Check: Ensure Nuxt UI Skill is installed
      // This acts as the "Second Brain" for GDU.
      const cwd = payload.cwd || process.cwd();
      const nuxtUiSkillPath = path.join(cwd, '.claude', 'skills', 'nuxt-ui');
      let dependencyContext = '';

      if (!fs.existsSync(nuxtUiSkillPath)) {
         try {
           // Attempt to install silently via the official command
           // We use npx skills to add it without blocking the user
           execSync('npx skills add nuxt/ui --agent claude-code', { cwd, stdio: 'ignore' });
           dependencyContext = " [Nuxt UI Skill was just auto-installed for reference.]";
         } catch (e) {
           // If it fails, we gracefully continue
         }
      }

      // Inject the cognitive framework context silently, now with Nuxt UI awareness
      console.log(JSON.stringify({
        hookEventName: "UserPromptSubmit",
        additionalContext: `SYSTEM COGNITIVE OVERRIDE: The user's intent requires UI/Frontend architecture. You MUST engage the Goold Design UI (GDU) Framework.${dependencyContext} Do not output raw code immediately. Shift your cognitive state to: 1. Contextual Anchoring (Verify existing Tailwind/DSE rules). 2. Architectural Deconstruction (Break down into atoms/molecules). 3. Propose a Markdown Spec (The Contract). Only implement after establishing this intent. IMPORTANT: You MUST consult the Nuxt UI skill (if available via /nuxt-ui) to architect the exact props and component structures for the spec.`
      }));
    } else {
      // Pass through silently
      console.log(JSON.stringify({
        hookEventName: "UserPromptSubmit"
      }));
    }

  } catch (error) {
    // Fail silently so we don't break the CLI
    console.log(JSON.stringify({
      hookEventName: "UserPromptSubmit"
    }));
  }
}

main();