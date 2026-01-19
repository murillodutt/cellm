---
id: SK-UI
version: v0.10.0
status: OK
skill: nuxt-ui
triggers: ["app/components/**", "app/pages/**"]
budget: ~200 tokens
---

# Nuxt UI v4

## Semantic Tokens

```vue
<!-- [+] Correct -->
<UButton color="primary">Save</UButton>
<UAlert color="error">Error</UAlert>
<span class="text-neutral-500">Text</span>

<!-- [-] Wrong -->
<UButton class="bg-blue-500">Save</UButton>
<span class="text-gray-500">Text</span>
```

## Available Colors

- primary (main action)
- neutral (text, borders)
- error (errors)
- warning (alerts)
- success (confirmations)

## Common Components

```vue
<UButton>Click</UButton>
<UInput v-model="value" />
<USelect v-model="selected" :options="opts" />
<UCard><template #header>Title</template></UCard>
<UModal v-model="open">Content</UModal>
<UTable :rows="data" :columns="cols" />
```
