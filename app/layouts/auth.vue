<template>
  <div class="flex min-h-svh flex-col">
    <header class="flex items-center justify-between p-4">
      <ULink to="/">
        <AppLogo class="h-6 w-auto shrink-0" />
      </ULink>

      <div class="flex items-center gap-1">
        <UColorModeButton />

        <LanguageSwitcher />
      </div>
    </header>

    <main class="flex flex-1 items-center justify-center px-4 py-12">
      <slot />
    </main>
  </div>
</template>
