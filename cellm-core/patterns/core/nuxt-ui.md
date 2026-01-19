---
id: UI-INDEX
tags: [nuxt-ui, components]
---

# Nuxt UI Patterns

## UI-001: Semantic Tokens

```vue
<!-- [+] Correct -->
<UButton color="primary">Save</UButton>
<UButton color="neutral" variant="outline">Cancel</UButton>
<UAlert color="error" title="Error" />

<!-- [-] Wrong -->
<UButton class="bg-blue-500">Save</UButton>
```

## UI-002: Variants

```vue
<!-- Solid (default) -->
<UButton>Click</UButton>

<!-- Outline -->
<UButton variant="outline">Click</UButton>

<!-- Ghost -->
<UButton variant="ghost">Click</UButton>

<!-- Link -->
<UButton variant="link">Click</UButton>
```

## UI-003: Form Components

```vue
<UFormGroup label="Email" name="email" required>
  <UInput v-model="email" type="email" />
</UFormGroup>

<UFormGroup label="Role" name="role">
  <USelect v-model="role" :options="roles" />
</UFormGroup>
```

## UI-004: Feedback

```vue
<!-- Toast -->
const toast = useToast()
toast.add({ title: 'Saved!', color: 'success' })

<!-- Modal -->
<UModal v-model="isOpen">
  <UCard>
    <template #header>Title</template>
    Content
    <template #footer>
      <UButton @click="isOpen = false">Close</UButton>
    </template>
  </UCard>
</UModal>
```

## UI-005: Table

```vue
<UTable
  :rows="users"
  :columns="[
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'actions', label: '' }
  ]"
>
  <template #actions-data="{ row }">
    <UButton size="xs" @click="edit(row)">Edit</UButton>
  </template>
</UTable>
```
